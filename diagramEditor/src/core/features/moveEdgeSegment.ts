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



import { Diagram } from "../diagram/diagram";
import { Anchor, DiagramEdge } from "../diagram/edge";
import { isVerticalLine, Vector } from "../geometry";
import { isReadonly, isSelected } from "../state";
import { generateId } from "../generateId";

import { cleanUpEdge } from "./cleanUpEdge";

export function canSegmentMove(
	parentEdgeId: string,
	selectedElements: Record<string, boolean>,
	readOnlyElements: Record<string, boolean>
): boolean {
	return isSelected(parentEdgeId, selectedElements) && !isReadonly(parentEdgeId, readOnlyElements);
}

export function moveSegment(edgeId: string, anchorId: string, vector: Vector, diagram: Diagram): Diagram {
	const edge = diagram.edges[edgeId];
	const startAnchor = edge.anchors.find(a => a.id === anchorId)!;
	const index = edge.anchors.indexOf(startAnchor);
	const endAnchor = edge.anchors[index + 1];
	const preparedEdge = duplicateStartAndEndAnchorIfNecessary(edge, startAnchor, endAnchor);
	const movedEdge = moveAnchors(preparedEdge, vector, startAnchor, endAnchor);

	return { ...diagram, edges: { ...diagram.edges, [edge.id]: cleanUpEdge(movedEdge, anchorId) } };
}

function duplicateStartAndEndAnchorIfNecessary(edge: DiagramEdge, startAnchor: Anchor, endAnchor: Anchor): DiagramEdge {
	const anchors = [...edge.anchors];
	const isFirstAnchor = edge.anchors.at(0) === startAnchor;
	const isLastAnchor = edge.anchors.at(-1) === endAnchor;

	if (isFirstAnchor) {
		anchors.unshift({ ...startAnchor, id: generateId("anchor-") });
	}
	if (isLastAnchor) {
		anchors.push({ ...endAnchor, id: generateId("anchor-") });
	}

	return { ...edge, anchors };
}

function moveAnchors(edge: DiagramEdge, vector: Vector, anchor1: Anchor, anchor2: Anchor): DiagramEdge {
	const anchors = edge.anchors.map(anchor => {
		if (anchor.id !== anchor1.id && anchor.id !== anchor2.id) {
			return anchor;
		}

		if (isVerticalLine(anchor1, anchor2)) {
			return { ...anchor, x: anchor.x + vector.x, y: anchor.y };
		} else {
			return { ...anchor, x: anchor.x, y: anchor.y + vector.y };
		}
	});

	return { ...edge, anchors };
}
