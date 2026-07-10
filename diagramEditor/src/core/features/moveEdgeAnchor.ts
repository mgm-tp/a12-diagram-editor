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

import type { Diagram } from "../diagram/diagram";
import type { Vector } from "../geometry";
import { isHorizontalLine } from "../geometry";
import { isReadonly } from "../state";
import type { Anchor } from "../diagram/edge";

import { cleanUpEdge, removeDuplicatedAnchors } from "./cleanUpEdge";

export function canMoveEdgeAnchor(parentEdgeId: string, readOnlyElements: Record<string, boolean>): boolean {
	return !isReadonly(parentEdgeId, readOnlyElements);
}

export function moveEdgeAnchor(parentEdgeId: string, anchorId: string, vector: Vector, diagram: Diagram): Diagram {
	const edge = diagram.edges[parentEdgeId];
	const draggedAnchorIndex = edge.anchors.findIndex(a => a.id === anchorId);
	const draggedAnchor = edge.anchors[draggedAnchorIndex];

	const movedAnchors = edge.anchors.flatMap((anchor, i) => {
		const isFirstAnchor = i === 0;
		const isLastAnchor = i === edge.anchors.length - 1;

		if (i === draggedAnchorIndex - 1) {
			return movePreviousAnchor(anchor, draggedAnchor, isFirstAnchor, vector);
		} else if (i === draggedAnchorIndex) {
			return moveDraggedAnchor(anchor, vector, isFirstAnchor, isLastAnchor);
		} else if (i === draggedAnchorIndex + 1) {
			return moveNextAnchor(anchor, draggedAnchor, vector, isLastAnchor);
		}

		return anchor;
	});

	/*
	 * We're not removing collinear segments here, as this could lead to a situation where the anchor is not under the
	 * mouse cursor anymore, which feels very unintuitive.
	 */
	const duplicateFreeEdge = removeDuplicatedAnchors({ ...edge, anchors: movedAnchors }, anchorId);

	return { ...diagram, edges: { ...diagram.edges, [parentEdgeId]: duplicateFreeEdge } };
}

export function moveEdgeAnchorEnded(parentEdgeId: string, anchorId: string, diagram: Diagram): Diagram {
	const edge = diagram.edges[parentEdgeId];
	return { ...diagram, edges: { ...diagram.edges, [parentEdgeId]: cleanUpEdge(edge) } };
}

function movePreviousAnchor(
	previousAnchor: Anchor,
	draggedAnchor: Anchor,
	isFirstAnchor: boolean,
	vector: Vector
): Anchor[] {
	const isHorizontal = isHorizontalLine(previousAnchor, draggedAnchor);
	const movedAnchor = isHorizontal
		? { ...previousAnchor, y: previousAnchor.y + vector.y }
		: { ...previousAnchor, x: previousAnchor.x + vector.x };

	return isFirstAnchor ? [{ ...previousAnchor, id: uniqueId("anchor-") }, movedAnchor] : [movedAnchor];
}

function moveDraggedAnchor(
	draggedAnchor: Anchor,
	vector: Vector,
	isFirstAnchor: boolean,
	isLastAnchor: boolean
): Anchor[] {
	const moved = { ...draggedAnchor, x: draggedAnchor.x + vector.x, y: draggedAnchor.y + vector.y };
	const result = [moved];

	if (isFirstAnchor) {
		result.unshift({ ...draggedAnchor, x: moved.x, id: uniqueId("anchor-1") });
		result.unshift({ ...draggedAnchor, id: uniqueId("anchor-") });
	} else if (isLastAnchor) {
		result.push({ ...draggedAnchor, x: moved.x, id: uniqueId("anchor-1") });
		result.push({ ...draggedAnchor, id: uniqueId("anchor-") });
	}

	return result;
}

function moveNextAnchor(nextAnchor: Anchor, draggedAnchor: Anchor, vector: Vector, isLastAnchor: boolean): Anchor[] {
	const isHorizontal = isHorizontalLine(draggedAnchor, nextAnchor);
	const movedAnchor = isHorizontal
		? { ...nextAnchor, y: nextAnchor.y + vector.y }
		: { ...nextAnchor, x: nextAnchor.x + vector.x };

	return isLastAnchor ? [movedAnchor, { ...nextAnchor, id: uniqueId("anchor-") }] : [movedAnchor];
}
