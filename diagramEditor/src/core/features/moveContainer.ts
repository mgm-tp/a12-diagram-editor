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

import type { Diagram } from "../diagram/diagram";
import { isConnectedEdge } from "../diagram/edge";
import type { Vector } from "../geometry";
import { isReadonly } from "../state";

import { moveEdgeEnd } from "./moveEdgeEnd";
import { moveElements } from "./moveElements";

export function canContainerMove(containerId: string, readOnlyElements: Record<string, boolean>): boolean {
	return !isReadonly(containerId, readOnlyElements);
}

export function moveContainer(containerId: string, vector: Vector, diagram: Diagram): Diagram {
	const container = diagram.containers[containerId];
	const movedContainer = { ...container, x: container.x + vector.x, y: container.y + vector.y };

	let result: Diagram = { ...diagram, containers: { ...diagram.containers, [containerId]: movedContainer } };
	result = moveConnectedEdges(containerId, vector, result);
	return moveElements(container.children, {}, vector, result);
}

function moveConnectedEdges(containerId: string, vector: Vector, diagram: Diagram): Diagram {
	let newDiagram = { ...diagram };
	Object.values(diagram.edges)
		.filter(isConnectedEdge)
		.forEach(edge => {
			const firstAnchor = edge.anchors.at(0);
			const lastAnchor = edge.anchors.at(-1);
			if (firstAnchor && edge.sourceNodeId === containerId) {
				newDiagram = moveEdgeEnd(edge.id, firstAnchor.id, vector, newDiagram);
			}
			if (lastAnchor && edge.targetNodeId === containerId) {
				newDiagram = moveEdgeEnd(edge.id, lastAnchor.id, vector, newDiagram);
			}
		});

	return newDiagram;
}
