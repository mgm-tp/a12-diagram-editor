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

import type { Offset, Point, Rectangle } from "../geometry";
import { calculateDistance } from "../geometry";
import { generateId } from "../generateId";

import type { DiagramElement } from "./diagramElement";
import type { DiagramNode } from "./node";
import { getNodeCenter } from "./node";
import type { DiagramContainer } from "./container";

export const DEFAULT_PORT_TYPE = "port";

export interface DiagramPort extends DiagramElement {
	type: typeof DEFAULT_PORT_TYPE;
	width: number;
	height: number;
	offset: Offset;
}

export function getPortPosition(element: Point, port: DiagramPort): Point {
	return {
		x: element.x + port.offset.left,
		y: element.y + port.offset.top
	};
}

export type PortOrientation = "top" | "right" | "bottom" | "left";

export function resolvePortOrientation(node: DiagramNode, port: DiagramPort): PortOrientation {
	const nodeCenter = getNodeCenter(node);
	const nodeCenterVector = { x: nodeCenter.x - node.x, y: nodeCenter.y - node.y };
	const centeredOffset = { left: port.offset.left - nodeCenterVector.x, top: port.offset.top - nodeCenterVector.y };
	const percentageLeft = centeredOffset.left / (node.width / 2);
	const percentageTop = centeredOffset.top / (node.height / 2);

	if (Math.abs(percentageLeft) > Math.abs(percentageTop)) {
		return centeredOffset.left > 0 ? "right" : "left";
	} else {
		return centeredOffset.top > 0 ? "bottom" : "top";
	}
}

export function findNearestPort(node: DiagramNode | DiagramContainer, position: Point): DiagramPort | undefined {
	const ports = Object.values(node.ports);
	if (ports.length === 0) {
		return undefined;
	}
	let nearestPort = ports[0];
	let shortestDistance = Infinity;

	ports.forEach(port => {
		const portPosition = getPortPosition(node, port);
		const distance = calculateDistance(portPosition, position);
		if (shortestDistance > distance) {
			nearestPort = port;
			shortestDistance = distance;
		}
	});

	return nearestPort;
}

export type PortMap = Record<string, DiagramPort>;

export interface PortDistribution {
	right: number;
	left: number;
	top: number;
	bottom: number;
}

export function generatePorts(
	element: Rectangle,
	portRadius: number,
	portDistribution: PortDistribution,
	portTemplate?: Partial<DiagramPort>
): PortMap {
	const result: PortMap = {};
	for (let i = 0; i < portDistribution.right; i++) {
		const divisor = portDistribution.right + 1;
		const fraction = (i + 1) / divisor;
		const port = createPortWithOffset({ top: element.height * fraction, left: element.width });
		result[port.id] = port;
	}

	for (let i = 0; i < portDistribution.left; i++) {
		const divisor = portDistribution.left + 1;
		const fraction = (i + 1) / divisor;
		const port = createPortWithOffset({ top: element.height * fraction, left: 0 });
		result[port.id] = port;
	}

	for (let i = 0; i < portDistribution.top; i++) {
		const divisor = portDistribution.top + 1;
		const fraction = (i + 1) / divisor;
		const port = createPortWithOffset({ top: 0, left: element.width * fraction });
		result[port.id] = port;
	}

	for (let i = 0; i < portDistribution.bottom; i++) {
		const divisor = portDistribution.bottom + 1;
		const fraction = (i + 1) / divisor;
		const port = createPortWithOffset({ top: element.height, left: element.width * fraction });
		result[port.id] = port;
	}

	return result;

	function createPortWithOffset(offset: Offset): DiagramPort {
		return {
			id: generateId("port"),
			type: "port",
			width: 2 * portRadius,
			height: 2 * portRadius,
			offset,
			...portTemplate
		};
	}
}
