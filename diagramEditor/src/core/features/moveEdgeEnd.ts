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

import { uniqueId } from "lodash";

import { assertExists } from "../assertions";
import type { Diagram } from "../diagram/diagram";
import type { Vector } from "../geometry";
import { resolveLineOrientation } from "../geometry";
import type { Anchor, DiagramEdge } from "../diagram/edge";

import { cleanUpEdge } from "./cleanUpEdge";

export function canMoveEdgeEnd(edgeId: string, readOnlyElements: Record<string, boolean>): boolean {
	return !readOnlyElements[edgeId];
}

export function moveEdgeEnd(edgeId: string, anchorId: string, vector: Vector, diagram: Diagram): Diagram {
	const edge = diagram.edges[edgeId];
	const anchor = edge.anchors.find(anchor => anchor.id === anchorId);
	assertExists(anchor, `Anchor with id ${anchorId} not found in edge ${edgeId}`);
	const index = edge.anchors.indexOf(anchor);
	const isFirstAnchor = index === 0;

	const movedEdge = isFirstAnchor ? moveSourceEnd(anchor, edge, vector) : moveTargetEnd(anchor, edge, vector);

	return { ...diagram, edges: { ...diagram.edges, [edgeId]: cleanUpEdge(movedEdge, anchorId) } };
}

function moveSourceEnd(anchor: Anchor, edge: DiagramEdge, vector: Vector): DiagramEdge {
	const result = [...edge.anchors];
	if (result.length < 3) {
		result.push({ ...edge.anchors[edge.anchors.length - 1], id: uniqueId("anchor-") });
	}

	result[1] = moveNeighborAnchor(anchor, result[1], vector);
	result[0] = { ...anchor, x: anchor.x + vector.x, y: anchor.y + vector.y };

	return { ...edge, anchors: result };
}

function moveTargetEnd(anchor: Anchor, edge: DiagramEdge, vector: Vector): DiagramEdge {
	const result = [...edge.anchors];
	if (result.length < 3) {
		result.unshift({ ...edge.anchors[0], id: uniqueId("anchor-") });
	}

	const neighborAnchor = result[result.length - 2];
	result[result.length - 2] = moveNeighborAnchor(anchor, neighborAnchor, vector);
	result[result.length - 1] = { ...anchor, x: anchor.x + vector.x, y: anchor.y + vector.y };

	return { ...edge, anchors: result };
}

function moveNeighborAnchor(movedAnchor: Anchor, neighborAnchor: Anchor, vector: Vector): Anchor {
	const segmentOrientation = resolveLineOrientation({ point1: movedAnchor, point2: neighborAnchor });

	return segmentOrientation === "horizontal"
		? { ...neighborAnchor, y: neighborAnchor.y + vector.y }
		: { ...neighborAnchor, x: neighborAnchor.x + vector.x };
}
