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

import type { Area, Point } from "../geometry";
import { calculateDistance, isOrthogonalLine, isPointInArea } from "../geometry";
import { requireArgument } from "../assertions";
import { generateId } from "../generateId";

import type { DiagramElement } from "./diagramElement";
import type { DiagramNode } from "./node";
import type { DiagramPort } from "./port";
import { getPortPosition } from "./port";
import type { Diagram } from "./diagram";
import type { DiagramContainer } from "./container";

export const DEFAULT_EDGE_TYPE = "edge";
export const DEFAULT_EDGE_SEGMENT_TYPE = "edge-segment";
export const DEFAULT_EDGE_LABEL_TYPE = "edge-label";

export interface DiagramEdge extends DiagramElement {
	type: typeof DEFAULT_EDGE_TYPE;
	anchors: Anchor[];
	labels?: { start?: EdgeEndLabels; middle?: EdgeLabel; end?: EdgeEndLabels };
}

export interface EdgeEndLabels {
	first?: EdgeLabel;
	second?: EdgeLabel;
}

export interface EdgeLabel {
	text?: string;
	subText?: string;
	customType?: string;
}

export type EdgeLabelPosition = "start-first" | "start-second" | "middle" | "end-first" | "end-second";

export interface ConnectedDiagramEdge extends DiagramEdge {
	sourceNodeId: string;
	sourcePortId: string;
	targetNodeId: string;
	targetPortId: string;
}

export interface UnconnectedDiagramEdge extends DiagramEdge {
	sourceNodeId?: string;
	sourcePortId?: string;
	targetNodeId?: string;
	targetPortId?: string;
}

export interface Anchor extends Point {
	id: string;
}

export interface DiagramEdgeMiddlePoint extends Point {
	segmentIndex: number;
}

export function isDiagramEdge(element: DiagramElement): element is DiagramEdge {
	return element.type === DEFAULT_EDGE_TYPE;
}

export function isConnectedEdge(edge: DiagramEdge): edge is ConnectedDiagramEdge {
	return (
		"sourceNodeId" in edge &&
		edge.sourceNodeId !== undefined &&
		"targetNodeId" in edge &&
		edge.targetNodeId !== undefined
	);
}

export function isUnconnectedEdge(edge: DiagramEdge): edge is UnconnectedDiagramEdge {
	return Reflect.get(edge, "sourceNodeId") === undefined || Reflect.get(edge, "targetNodeId") === undefined;
}

export function createUnconnectedEdge(
	element: DiagramNode | DiagramContainer,
	port: DiagramPort
): UnconnectedDiagramEdge {
	const portPosition = getPortPosition(element, port);
	const anchors = [
		{ id: generateId("anchor"), ...portPosition },
		{ id: generateId("anchor"), ...portPosition }
	];

	return { id: generateId("edge"), type: "edge", anchors, sourceNodeId: element.id, sourcePortId: port.id };
}

export function createConnectedEdge(
	node1: DiagramNode,
	port1: DiagramPort,
	node2: DiagramNode,
	port2: DiagramPort
): ConnectedDiagramEdge {
	const portPosition1 = getPortPosition(node1, port1);
	const portPosition2 = getPortPosition(node2, port2);
	const anchors = [
		{ id: generateId("anchor"), ...portPosition1 },
		{ id: generateId("anchor"), ...portPosition2 }
	];

	const edge: ConnectedDiagramEdge = {
		type: "edge",
		id: generateId("edge"),
		sourceNodeId: node1.id,
		sourcePortId: port1.id,
		targetNodeId: node2.id,
		targetPortId: port2.id,
		anchors: []
	};

	if (isOrthogonalLine(anchors[0], anchors[1])) {
		return { ...edge, anchors };
	} else {
		const rightAngleAnchors: Anchor[] = [
			anchors[0],
			{ id: generateId("anchor"), x: anchors[0].x, y: anchors[1].y },
			anchors[1]
		];
		return { ...edge, anchors: rightAngleAnchors };
	}
}

export function calculateEdgeMiddlePoint(edge: DiagramEdge): DiagramEdgeMiddlePoint {
	const { anchors } = edge;
	requireArgument(anchors.length >= 2, "Edge must have at least two anchors");

	const segmentLengths = calculateSegmentLengths(edge);
	const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
	const halfTotalLength = totalLength / 2;

	if (totalLength === 0) {
		return { segmentIndex: 0, x: anchors[0].x, y: anchors[0].y };
	}

	let traveledDistance = 0;

	for (let i = 0; i < anchors.length - 1; i++) {
		const anchor = anchors[i];
		const nextAnchor = anchors[i + 1];
		const segmentLength = segmentLengths[i];

		if (traveledDistance + segmentLength <= halfTotalLength) {
			traveledDistance += segmentLength;
			continue;
		}

		const restLength = halfTotalLength - traveledDistance;
		const ratio = restLength / segmentLength;
		return {
			segmentIndex: i,
			x: anchor.x + (nextAnchor.x - anchor.x) * ratio,
			y: anchor.y + (nextAnchor.y - anchor.y) * ratio
		};
	}

	throw Error("Failed to calculate middle point of edge");
}

function calculateSegmentLengths(edge: DiagramEdge): number[] {
	return edge.anchors
		.map((anchor, index) => {
			if (index === edge.anchors.length - 1) {
				return 0;
			}
			const nextAnchor = edge.anchors[index + 1];
			return calculateDistance(anchor, nextAnchor);
		})
		.slice(0, -1);
}

export function isEdgeContainedInArea(edge: DiagramEdge, area: Area): boolean {
	return edge.anchors.every(anchor => isPointInArea(area, anchor));
}

export function getConnectedElements(
	edge: DiagramEdge,
	diagram: Diagram
): { source: DiagramNode | DiagramContainer | undefined; target: DiagramNode | DiagramContainer | undefined } {
	requireArgument(isConnectedEdge(edge) || isUnconnectedEdge(edge), "Edge must be connected or unconnected");
	const sourceNodeId = edge.sourceNodeId ?? "";
	const targetNodeId = edge.targetNodeId ?? "";
	const sourceElement = diagram.nodes[sourceNodeId] ?? diagram.containers[sourceNodeId];
	const targetElement = diagram.nodes[targetNodeId] ?? diagram.containers[targetNodeId];

	return { source: sourceElement, target: targetElement };
}
