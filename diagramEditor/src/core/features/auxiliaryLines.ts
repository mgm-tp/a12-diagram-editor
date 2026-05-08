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



import { Line } from "../geometry";
import { DiagramNode, areNodesOverlapping } from "../diagram/node";

export function calculateAuxiliaryLines(node1: DiagramNode, node2: DiagramNode): Line[] {
	if (areNodesOverlapping(node1, node2)) {
		return [];
	}
	return [...calculateHorizontalAuxiliaryLines(node1, node2), ...calculateVerticalAuxiliaryLines(node1, node2)];
}

function calculateVerticalAuxiliaryLines(node1: DiagramNode, node2: DiagramNode): Line[] {
	const lines: Line[] = [];
	const [topNode, bottomNode] = node1.y > node2.y ? [node1, node2] : [node2, node1];

	if (topNode.x === bottomNode.x) {
		lines.push({
			point1: { x: topNode.x, y: topNode.y },
			point2: { x: bottomNode.x, y: bottomNode.y + bottomNode.height }
		});
	}
	if (topNode.x + topNode.width === bottomNode.x + bottomNode.width) {
		lines.push({
			point1: { x: topNode.x + topNode.width, y: topNode.y },
			point2: { x: bottomNode.x + bottomNode.width, y: bottomNode.y + bottomNode.height }
		});
	}
	return lines;
}

function calculateHorizontalAuxiliaryLines(node1: DiagramNode, node2: DiagramNode): Line[] {
	const lines: Line[] = [];
	const [leftNode, rightNode] = node1.x < node2.x ? [node1, node2] : [node2, node1];

	if (leftNode.y === rightNode.y) {
		lines.push({
			point1: { x: leftNode.x + leftNode.width, y: leftNode.y },
			point2: { x: rightNode.x, y: rightNode.y }
		});
	}
	if (leftNode.y + leftNode.height === rightNode.y + rightNode.height) {
		lines.push({
			point1: { x: leftNode.x + leftNode.width, y: leftNode.y + leftNode.height },
			point2: { x: rightNode.x, y: rightNode.y + rightNode.height }
		});
	}
	return lines;
}
