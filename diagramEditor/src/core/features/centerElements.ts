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
import type { Offset, Point, Rectangle } from "../geometry";
import { getNodeCenter } from "../diagram/node";
import type { UIState } from "../state";
import { assertExists } from "../assertions";

export function centerCanvas(diagram: Diagram, uiState: UIState, canvasDimension: Rectangle) {
	const { minX, maxX, minY, maxY } = findBoundaries(diagram);
	const centerPosition: Point = {
		x: (maxX + minX) / 2,
		y: (maxY + minY) / 2
	};
	const offset = calculateOffset(centerPosition, uiState.zoomLevel, canvasDimension);
	return {
		...uiState,
		offset
	};
}

export function centerNode(nodeId: string, diagram: Diagram, uiState: UIState, canvasDimension: Rectangle): UIState {
	const node = diagram.nodes[nodeId];
	assertExists(node, `Node with id ${nodeId} does not exist in the diagram`);

	const centerPosition = getNodeCenter(node);
	const offset = calculateOffset(centerPosition, uiState.zoomLevel, canvasDimension);
	return {
		...uiState,
		offset
	};
}

function calculateOffset(centerPosition: Point, zoomLevel: number, canvasDimension: Rectangle): Offset {
	const scaledX = (centerPosition.x * zoomLevel) / 100;
	const scaledY = (centerPosition.y * zoomLevel) / 100;
	return {
		left: canvasDimension.width / 2 - scaledX,
		top: canvasDimension.height / 2 - scaledY
	};
}

function findBoundaries(diagram: Diagram) {
	let maxX, maxY, minX, minY;
	maxX = maxY = Number.MIN_SAFE_INTEGER;
	minX = minY = Number.MAX_SAFE_INTEGER;
	if (Object.values(diagram.nodes).length === 0) {
		return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
	}

	for (const node of Object.values(diagram.nodes)) {
		const nodeCenter = getNodeCenter(node);
		maxX = nodeCenter.x > maxX ? nodeCenter.x : maxX;
		maxY = nodeCenter.y > maxY ? nodeCenter.y : maxY;
		minX = nodeCenter.x < minX ? nodeCenter.x : minX;
		minY = nodeCenter.y < minY ? nodeCenter.y : minY;
	}
	return { minX, maxX, minY, maxY };
}
