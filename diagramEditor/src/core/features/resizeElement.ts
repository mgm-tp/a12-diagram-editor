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



import { DiagramContainer } from "../diagram/container";
import { Diagram } from "../diagram/diagram";
import { isConnectedEdge } from "../diagram/edge";
import { DiagramNode, isDiagramNode } from "../diagram/node";
import { getPortPosition, PortMap } from "../diagram/port";
import { Vector } from "../geometry";

import { moveEdgeEnd } from "./moveEdgeEnd";

export type ResizePointOrientation =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right"
	| "left"
	| "right"
	| "top"
	| "bottom";

type ResizableElement = DiagramNode | DiagramContainer;

export function resizeElement(
	elementId: string,
	orientation: ResizePointOrientation,
	vector: Vector,
	diagram: Diagram
): Diagram {
	const element = (diagram.nodes[elementId] ?? diagram.containers[elementId]) as ResizableElement;
	const minLength = 30;
	let resizedElement = doResizeElement(element, orientation, vector);
	if (resizedElement.width < minLength || resizedElement.height < minLength) {
		return diagram;
	}
	resizedElement = movePorts(element, resizedElement);
	const updatedDiagram = isDiagramNode(resizedElement)
		? { ...diagram, nodes: { ...diagram.nodes, [elementId]: resizedElement } }
		: { ...diagram, containers: { ...diagram.containers, [elementId]: resizedElement } };

	return moveConnectedEdges(resizedElement, updatedDiagram);
}

function doResizeElement(
	element: ResizableElement,
	orientation: ResizePointOrientation,
	vector: Vector
): ResizableElement {
	switch (orientation) {
		case "top-left":
			return {
				...element,
				x: element.x + vector.x,
				y: element.y + vector.y,
				width: element.width - vector.x,
				height: element.height - vector.y
			};
		case "top-right":
			return {
				...element,
				y: element.y + vector.y,
				width: element.width + vector.x,
				height: element.height - vector.y
			};
		case "bottom-left":
			return {
				...element,
				x: element.x + vector.x,
				width: element.width - vector.x,
				height: element.height + vector.y
			};
		case "bottom-right":
			return { ...element, width: element.width + vector.x, height: element.height + vector.y };
		case "left":
			return { ...element, x: element.x + vector.x, width: element.width - vector.x };
		case "right":
			return { ...element, width: element.width + vector.x };
		case "top":
			return { ...element, y: element.y + vector.y, height: element.height - vector.y };
		case "bottom":
			return { ...element, height: element.height + vector.y };
		default:
			throw new Error(`Unknown resize orientation ${orientation}`);
	}
}

function movePorts(oldElement: ResizableElement, newElement: ResizableElement): ResizableElement {
	const newPorts = Object.values(oldElement.ports).reduce((acc, port) => {
		const leftFraction = port.offset.left / oldElement.width;
		const topFraction = port.offset.top / oldElement.height;
		acc[port.id] = {
			...port,
			offset: { left: leftFraction * newElement.width, top: topFraction * newElement.height }
		};
		return acc;
	}, {} as PortMap);
	return { ...newElement, ports: newPorts };
}

function moveConnectedEdges(element: ResizableElement, diagram: Diagram): Diagram {
	const connectedEdges = Object.values(diagram.edges)
		.filter(isConnectedEdge)
		.filter(edge => edge.sourceNodeId === element.id || edge.targetNodeId === element.id);

	let result = { ...diagram };

	connectedEdges.forEach(edge => {
		const port = edge.sourceNodeId === element.id ? edge.sourcePortId : edge.targetPortId;
		const anchor = edge.sourceNodeId === element.id ? edge.anchors[0] : edge.anchors[edge.anchors.length - 1];
		const portPosition = getPortPosition(element, element.ports[port]);
		const vector = { x: portPosition.x - anchor.x, y: portPosition.y - anchor.y };
		result = moveEdgeEnd(edge.id, anchor.id, vector, result);
	});

	return result;
}
