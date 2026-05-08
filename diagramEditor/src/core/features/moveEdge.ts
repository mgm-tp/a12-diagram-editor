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
import { DiagramEdge, isConnectedEdge } from "../diagram/edge";
import { Vector } from "../geometry";
import { isReadonly, isSelected } from "../state";

import { canNodeMove } from "./moveNode";

export function canEdgeMove(
	id: string,
	selectedElements: Record<string, boolean>,
	readOnlyElements: Record<string, boolean>,
	diagram: Diagram
): boolean {
	const edge = diagram.edges[id];
	return (
		!isReadonly(id, readOnlyElements) &&
		isConnectedEdge(edge) &&
		canNodeMove(edge.sourceNodeId, readOnlyElements) &&
		isSelected(edge.sourceNodeId, selectedElements) &&
		canNodeMove(edge.targetNodeId, readOnlyElements) &&
		isSelected(edge.targetNodeId, selectedElements)
	);
}

export function moveEdge(edge: DiagramEdge, vector: Vector, diagram: Diagram): Diagram {
	if (edge.anchors.length < 3) {
		return diagram;
	}

	const movedAnchors = edge.anchors.map(a => ({ ...a, x: a.x + vector.x, y: a.y + vector.y }));
	return { ...diagram, edges: { ...diagram.edges, [edge.id]: { ...edge, anchors: movedAnchors } } };
}
