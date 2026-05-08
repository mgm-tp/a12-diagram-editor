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



import { resolveContainedElements } from "../diagram/container";
import { Diagram } from "../diagram/diagram";
import { Vector } from "../geometry";
import { isContainer, isEdge, isNode } from "../state";

import { canContainerMove, moveContainer } from "./moveContainer";
import { canEdgeMove, moveEdge } from "./moveEdge";
import { canNodeMove, moveNode } from "./moveNode";

/**
 * Determines which of the selected elements are moveable and moves them.
 */
export function moveElements(
	elements: string[],
	readOnlyElements: Record<string, boolean>,
	vector: Vector,
	diagram: Diagram
) {
	let result = diagram;
	const movedContainerElements = new Set<string>();
	const selectedElements = elements.reduce<Record<string, boolean>>((acc, id) => {
		acc[id] = true;
		return acc;
	}, {});

	elements
		.filter(id => isContainer(id, diagram) && canContainerMove(id, readOnlyElements))
		.forEach(containerId => {
			if (!movedContainerElements.has(containerId)) {
				resolveContainedElements(diagram.containers[containerId], diagram).forEach(it =>
					movedContainerElements.add(it.id)
				);
				result = moveContainer(containerId, vector, result);
			}
		});

	// nodes must be moved before edges
	elements
		.filter(id => isNode(id, diagram) && !movedContainerElements.has(id) && canNodeMove(id, readOnlyElements))
		.forEach(nodeId => (result = moveNode(nodeId, vector, result)));

	elements
		.filter(
			id =>
				isEdge(id, diagram) &&
				!movedContainerElements.has(id) &&
				canEdgeMove(id, selectedElements, readOnlyElements, diagram)
		)
		.forEach(edgeId => (result = moveEdge(diagram.edges[edgeId], vector, result)));

	return result;
}

export function canElementMove(
	id: string,
	selectedElements: Record<string, boolean>,
	readOnlyElements: Record<string, boolean>,
	diagram: Diagram
): boolean {
	if (isEdge(id, diagram)) {
		return canEdgeMove(id, selectedElements, readOnlyElements, diagram);
	}
	if (isNode(id, diagram)) {
		return canNodeMove(id, readOnlyElements);
	}
	if (isContainer(id, diagram)) {
		return canContainerMove(id, readOnlyElements);
	}
	throw new Error("Dragged element for move elements should be edge or node");
}
