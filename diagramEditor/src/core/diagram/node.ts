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



import { Point, Rectangle } from "../geometry";
import { generateId } from "../generateId";

import { DiagramPort, generatePorts, PortDistribution, PortMap } from "./port";
import { DiagramElement } from "./diagramElement";

export const DEFAULT_NODE_TYPE = "node";

// Position of node specifies the coordinate of the left top corner
export interface DiagramNode extends DiagramElement, Point, Rectangle {
	type: typeof DEFAULT_NODE_TYPE;
	label: string;
	ports: PortMap;
}

export function isDiagramNode(element: DiagramElement): element is DiagramNode {
	return element.type === DEFAULT_NODE_TYPE;
}

export function createDiagramNode(
	partialNode: Partial<DiagramNode> = {},
	portDistribution?: PortDistribution,
	portTemplate?: Partial<DiagramPort>
): DiagramNode {
	const {
		id = generateId("node"),
		type = DEFAULT_NODE_TYPE,
		customType = undefined,
		x = 0,
		y = 0,
		width = 160,
		height = 80,
		label = "",
		ports = {}
	} = partialNode;

	const node = { id, type, x, y, width, height, label, ports, customType };
	const generatedPorts = portDistribution ? generatePorts(node, 4, portDistribution, portTemplate) : ports;
	return { ...node, ports: generatedPorts };
}

export function areNodesOverlapping(node1: DiagramNode, node2: DiagramNode): boolean {
	return !(
		node1.x + node1.width <= node2.x ||
		node1.x >= node2.x + node2.width ||
		node1.y + node1.height <= node2.y ||
		node1.y >= node2.y + node2.height
	);
}

export function getNodeCenter(node: DiagramNode): Point {
	const { x, y, width, height } = node;
	return {
		x: x + width / 2,
		y: y + height / 2
	};
}
