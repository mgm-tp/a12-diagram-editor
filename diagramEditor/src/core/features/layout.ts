/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License – EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { graphlib, layout } from "@dagrejs/dagre";

import { assertExists, requireArgument } from "../assertions";
import type { Diagram } from "../diagram/diagram";
import { mergeDiagrams } from "../diagram/diagram";
import type { Anchor, ConnectedDiagramEdge, DiagramEdge } from "../diagram/edge";
import { isConnectedEdge } from "../diagram/edge";
import { findNearestPort, getPortPosition } from "../diagram/port";
import type { Vector } from "../geometry";
import { calculateAngle, isRightAngle } from "../geometry";
import { isNode } from "../state";
import type { DiagramContainer } from "../diagram/container";
import { isDiagramContainer, resolveContainedElements } from "../diagram/container";
import { isDiagramNode } from "../diagram/node";
import { generateId } from "../generateId";

import { moveEdgeEnd } from "./moveEdgeEnd";
import { moveElements } from "./moveElements";
import { resizeElement } from "./resizeElement";
import { moveContainer } from "./moveContainer";

export function layoutDiagram(diagram: Diagram): Diagram {
	const layouted = layoutDiagramRecursively(diagram);
	const orthogonal = enforceOrthogonalEdges(layouted);
	return connectEdgesToNearestPorts(orthogonal);
}

function layoutDiagramRecursively(diagram: Diagram): Diagram {
	let result = diagram;
	Object.values(result.containers)
		.filter(container => container.children.length > 0)
		.forEach(({ id }) => {
			const container = result.containers[id];
			const subDiagram = createDiagramFromContainer(container, result);
			const layouted = layoutDiagramRecursively(subDiagram);
			const merged = mergeDiagrams(result, layouted);
			const vector = { x: container.x + 20, y: container.y + 40 };
			const moved = moveElements(container.children, {}, vector, merged);
			const resized = resizeContainer(container, moved);
			result = resized;
		});

	const ids = new Set([...Object.keys(result.nodes), ...Object.keys(result.containers)]);
	Object.values(result.containers)
		.flatMap(container => container.children)
		.forEach(childId => ids.delete(childId));

	const layouted = layoutByIds(result, ids);
	return mergeDiagrams(result, layouted);
}

function createDiagramFromContainer(container: DiagramContainer, diagram: Diagram): Diagram {
	const subDiagram: Diagram = { nodes: {}, containers: {}, edges: diagram.edges };
	resolveContainedElements(container, diagram).forEach(element => {
		if (element.type === "node") {
			subDiagram.nodes[element.id] = diagram.nodes[element.id];
		} else if (element.type === "container") {
			subDiagram.containers[element.id] = diagram.containers[element.id];
		}
	});
	return subDiagram;
}

function layoutByIds(diagram: Diagram, ids: Set<string>): Diagram {
	const graph = createDagreGraph(diagram, ids);
	layout(graph);
	return convertDagreGraph(graph, diagram);
}

const GENERATED_EDGE_ID = "generated";

function createDagreGraph(diagram: Diagram, ids: Set<string>): graphlib.Graph {
	const graph = new graphlib.Graph({ multigraph: true });
	graph.setGraph({ rankdir: "LR", align: "DL", ranksep: 100, nodesep: 50 });
	const containerMap = new Map<string, string>();
	ids.forEach(id => {
		const container = diagram.containers[id];
		if (container) {
			resolveContainedElements(container, diagram).forEach(e => containerMap.set(e.id, id));
		}
	});

	ids.forEach(id => {
		const element = diagram.nodes[id] ?? diagram.containers[id];
		if (element) {
			graph.setNode(id, { width: element.width, height: element.height });
		}
	});

	Object.values(diagram.edges)
		.filter(isConnectedEdge)
		.forEach(edge => {
			if (ids.has(edge.sourceNodeId) && ids.has(edge.targetNodeId)) {
				graph.setEdge(edge.sourceNodeId, edge.targetNodeId, {}, edge.id);
			} else if (ids.has(edge.sourceNodeId) && containerMap.has(edge.targetNodeId)) {
				graph.setEdge(
					edge.sourceNodeId,
					containerMap.get(edge.targetNodeId)!,
					{},
					`${GENERATED_EDGE_ID}$$${edge.id}$$${edge.sourceNodeId}$$${edge.targetNodeId}`
				);
			} else if (ids.has(edge.targetNodeId) && containerMap.has(edge.sourceNodeId)) {
				graph.setEdge(
					containerMap.get(edge.sourceNodeId)!,
					edge.targetNodeId,
					{},
					`${GENERATED_EDGE_ID}$$${edge.id}$$${edge.sourceNodeId}$$${edge.targetNodeId}`
				);
			}
		});

	return graph;
}

function convertDagreGraph(graph: graphlib.Graph, originalDiagram: Diagram): Diagram {
	let result: Diagram = {
		edges: { ...originalDiagram.edges },
		nodes: { ...originalDiagram.nodes },
		containers: { ...originalDiagram.containers }
	};

	graph.nodes().forEach(nodeId => {
		const node = graph.node(nodeId);
		const originalNode = originalDiagram.nodes[nodeId];
		const originalContainer = originalDiagram.containers[nodeId];
		const position = { x: node.x - node.width / 2, y: node.y - node.height / 2 };

		if (originalNode) {
			result.nodes[nodeId] = { ...originalNode, ...position };
		} else if (originalContainer) {
			const vector = { x: position.x - originalContainer.x, y: position.y - originalContainer.y };
			result = moveContainer(originalContainer.id, vector, result);
		}
	});

	graph.edges().forEach(edgeIdentifier => {
		assertExists(edgeIdentifier.name, "Edge name should not be undefined");
		let originalEdge = originalDiagram.edges[edgeIdentifier.name];
		let sourceNodeId = originalEdge && isConnectedEdge(originalEdge) ? originalEdge.sourceNodeId : undefined;
		let targetNodeId = originalEdge && isConnectedEdge(originalEdge) ? originalEdge.targetNodeId : undefined;

		if (edgeIdentifier.name.startsWith(GENERATED_EDGE_ID)) {
			const [, edgeId, source, target] = edgeIdentifier.name.split("$$");
			sourceNodeId = source;
			targetNodeId = target;
			originalEdge = originalDiagram.edges[edgeId];
		}

		const edge = graph.edge(edgeIdentifier);
		const anchors = edge.points.map((point: { x: number; y: number }) => ({
			id: generateId("anchor-"),
			x: point.x,
			y: point.y
		}));

		const newEdge = { ...originalEdge, sourceNodeId, targetNodeId, anchors };
		result.edges[originalEdge.id] = newEdge;
	});

	return result;
}

function connectEdgesToNearestPorts(diagram: Diagram): Diagram {
	const result: Record<string, DiagramEdge> = {};

	Object.values(diagram.edges).forEach(edge => {
		requireArgument(isConnectedEdge(edge), "Only connected edges can be laid out");
		const movedSourceDiagram = connectEdgeEndToPort("source", edge, diagram);
		const edge1 = movedSourceDiagram.edges[edge.id] as ConnectedDiagramEdge;
		const movedTargetDiagram = connectEdgeEndToPort("target", edge1, movedSourceDiagram);

		result[edge.id] = movedTargetDiagram.edges[edge.id];
	});

	return { ...diagram, edges: result };
}

function connectEdgeEndToPort(type: "target" | "source", edge: ConnectedDiagramEdge, diagram: Diagram): Diagram {
	const nodeId = type === "source" ? edge.sourceNodeId : edge.targetNodeId;
	const anchor = type === "source" ? edge.anchors[0] : edge.anchors[edge.anchors.length - 1];
	const node = isNode(nodeId, diagram) ? diagram.nodes[nodeId] : diagram.containers[nodeId];
	const port = findNearestPort(node, anchor);

	if (!port) {
		return diagram;
	}

	const portPosition = getPortPosition(node, port);
	const vector: Vector = { x: portPosition.x - anchor.x, y: portPosition.y - anchor.y };

	const movedDiagram = moveEdgeEnd(edge.id, anchor.id, vector, diagram);
	const movedEdge = movedDiagram.edges[edge.id];

	const result = {
		...movedEdge,
		sourcePortId: type === "source" ? port.id : edge.sourcePortId,
		targetPortId: type === "target" ? port.id : edge.targetPortId
	};

	return { ...movedDiagram, edges: { ...movedDiagram.edges, [edge.id]: result } };
}

function resizeContainer(container: DiagramContainer, diagram: Diagram): Diagram {
	let result = diagram;
	const childContainers = container.children.map(id => diagram.containers[id]).filter(c => c !== undefined);
	childContainers.forEach(child => (result = resizeContainer(child, result)));

	let x1 = Infinity;
	let x2 = -Infinity;
	let y1 = Infinity;
	let y2 = -Infinity;

	resolveContainedElements(container, diagram).forEach(element => {
		if (isDiagramNode(element) || isDiagramContainer(element)) {
			x1 = Math.min(x1, element.x);
			x2 = Math.max(x2, element.x + element.width);
			y1 = Math.min(y1, element.y);
			y2 = Math.max(y2, element.y + element.height);
		}
	});

	if (x1 === Infinity || y1 === Infinity || x2 === -Infinity || y2 === -Infinity) {
		return diagram;
	}

	const padding = 20;
	const labelOffset = 20;
	const width = x2 - x1 + 2 * padding;
	const height = y2 - y1 + 2 * padding + labelOffset;

	const movedContainer = { ...container, x: x1 - padding, y: y1 - padding - labelOffset };
	const movedDiagram = { ...diagram, containers: { ...diagram.containers, [container.id]: movedContainer } };
	const vector = { x: width - container.width, y: height - container.height };
	return resizeElement(movedContainer.id, "bottom-right", vector, movedDiagram);
}

function enforceOrthogonalEdges(diagram: Diagram): Diagram {
	const result: Record<string, DiagramEdge> = {};

	Object.values(diagram.edges).forEach(edge => {
		const newEdge = enforceOrthogonality(removeRedundantAnchors(edge));
		result[edge.id] = newEdge;
	});

	return { ...diagram, edges: result };
}

function enforceOrthogonality(edge: DiagramEdge): DiagramEdge {
	const newAnchors: Anchor[] = [];
	edge.anchors.forEach((anchor, i) => {
		const leftAnchor = newAnchors[i - 1];
		const rightAnchor = edge.anchors[i + 1];
		if (!leftAnchor || !rightAnchor || isRightAngle(leftAnchor, anchor, rightAnchor)) {
			newAnchors.push(anchor);
			return;
		}

		const angle1 = calculateAngle({ point1: leftAnchor, point2: anchor });
		const isHorizontalAngle = (angle1 > 45 && angle1 <= 135) || (angle1 > 225 && angle1 <= 315);

		const result = isHorizontalAngle
			? { ...anchor, x: rightAnchor.x, y: leftAnchor.y }
			: { ...anchor, x: leftAnchor.x, y: rightAnchor.y };
		newAnchors.push(result);
	});

	return { ...edge, anchors: newAnchors.filter(anchor => anchor !== undefined) };
}

function removeRedundantAnchors(edge: DiagramEdge): DiagramEdge {
	const newAnchors = edge.anchors.filter((anchor, i) => {
		const leftAnchor = edge.anchors[i - 1];
		const rightAnchor = edge.anchors[i + 1];
		if (!leftAnchor || !rightAnchor || isRightAngle(leftAnchor, anchor, rightAnchor)) {
			return anchor;
		}

		const angle1 = calculateAngle({ point1: leftAnchor, point2: anchor });
		const angle2 = calculateAngle({ point1: anchor, point2: rightAnchor });
		return angle1 % 180 !== angle2 % 180;
	});
	return { ...edge, anchors: newAnchors };
}
