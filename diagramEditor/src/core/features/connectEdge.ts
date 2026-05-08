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



import { isUnconnectedEdge, ConnectedDiagramEdge } from "../diagram/edge";
import { getPortPosition } from "../diagram/port";
import { assertExists, requireArgument } from "../assertions";
import { DiagramState } from "../state";
import { Diagram } from "../diagram/diagram";

import { moveEdgeEnd } from "./moveEdgeEnd";

export function connectEdge(edgeId: string, portId: string, state: DiagramState): Diagram {
	const { diagram, backup } = state;
	const edge = diagram.edges[edgeId];
	requireArgument(isUnconnectedEdge(edge), "Edge must be unconnected to connect to a port");
	if (edge.sourcePortId === portId || edge.targetPortId === portId) {
		assertExists(backup, "Corrupt state: Cannot connect edge without a backup state");
		return backup;
	}
	const element = Object.values({ ...diagram.nodes, ...diagram.containers }).find(n => n.ports[portId]);
	const port = element?.ports[portId];
	requireArgument(element !== undefined && port !== undefined, "Port not found in any node");

	const portPosition = getPortPosition(element, port);
	const isSourcePortConnected = edge.sourcePortId !== undefined;
	const anchor = isSourcePortConnected ? edge.anchors[edge.anchors.length - 1] : edge.anchors[0];
	const vector = { x: portPosition.x - anchor.x, y: portPosition.y - anchor.y };
	const movedEdgeDiagram = moveEdgeEnd(edgeId, anchor.id, vector, diagram);

	const movedEdge = movedEdgeDiagram.edges[edgeId];
	requireArgument(isUnconnectedEdge(movedEdge), "Edge must be unconnected after moving end");

	const updatedEdge: ConnectedDiagramEdge = {
		...edge,
		sourceNodeId: movedEdge.sourceNodeId ?? element.id,
		sourcePortId: movedEdge.sourcePortId ?? portId,
		targetNodeId: movedEdge.targetNodeId ?? element.id,
		targetPortId: movedEdge.targetPortId ?? portId,
		anchors: movedEdge.anchors
	};

	const updatedDiagram: Diagram = { ...movedEdgeDiagram, edges: { ...movedEdgeDiagram.edges, [edgeId]: updatedEdge } };
	return handleContainers(updatedEdge, updatedDiagram);
}

function handleContainers(edge: ConnectedDiagramEdge, diagram: Diagram): Diagram {
	const currentContainer = Object.values(diagram.containers).find(c => c.children.includes(edge.id));
	const targetContainer = Object.values(diagram.containers).find(
		c => c.children.includes(edge.sourceNodeId) && c.children.includes(edge.targetNodeId)
	);

	const result: Diagram = { ...diagram, containers: { ...diagram.containers } };

	if (currentContainer) {
		result.containers[currentContainer.id] = {
			...currentContainer,
			children: currentContainer.children.filter(id => id !== edge.id)
		};
	}

	if (targetContainer) {
		result.containers[targetContainer.id] = { ...targetContainer, children: [...targetContainer.children, edge.id] };
	}

	return result;
}
