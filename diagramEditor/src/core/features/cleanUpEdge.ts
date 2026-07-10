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

import { isSamePoint, resolveLineOrientation } from "../geometry";
import type { DiagramEdge } from "../diagram/edge";

export function cleanUpEdge(edge: DiagramEdge, protectedAnchorId?: string): DiagramEdge {
	const duplicateFree = removeDuplicatedAnchors(edge, protectedAnchorId);
	return removeCollinearSegments(duplicateFree, protectedAnchorId);
}

export function removeDuplicatedAnchors(edge: DiagramEdge, protectedAnchorId?: string): DiagramEdge {
	for (let i = 0; i <= edge.anchors.length - 2; i++) {
		const anchor = edge.anchors[i];
		const nextAnchor = edge.anchors[i + 1];
		if (!isSamePoint(anchor, nextAnchor)) {
			continue;
		}

		const lastPreviousAnchor = nextAnchor.id === protectedAnchorId ? nextAnchor : anchor;
		const previousAnchors = edge.anchors.slice(0, i);
		const nextAnchors = edge.anchors.slice(i + 2);
		const anchors = [...previousAnchors, lastPreviousAnchor, ...nextAnchors];
		return removeDuplicatedAnchors({ ...edge, anchors }, protectedAnchorId);
	}

	return edge;
}

export function removeCollinearSegments(edge: DiagramEdge, protectedAnchorId?: string): DiagramEdge {
	for (let i = 1; i <= edge.anchors.length - 2; i++) {
		const nextAnchor = edge.anchors[i];
		const nextSegment = { point1: nextAnchor, point2: edge.anchors[i + 1] };
		const nextOrientation = resolveLineOrientation(nextSegment);
		const previousAnchor = edge.anchors[i - 1];
		const previousSegment = { point1: previousAnchor, point2: nextAnchor };
		const previousOrientation = resolveLineOrientation(previousSegment);

		if (previousOrientation === "diagonal" || previousOrientation !== nextOrientation) {
			continue;
		}

		const lastPreviousAnchor =
			nextAnchor.id === protectedAnchorId ? { ...previousAnchor, id: protectedAnchorId } : previousAnchor;
		const anchors = [...edge.anchors.slice(0, i - 1), lastPreviousAnchor, ...edge.anchors.slice(i + 1)];
		return removeCollinearSegments({ ...edge, anchors }, protectedAnchorId);
	}

	return edge;
}
