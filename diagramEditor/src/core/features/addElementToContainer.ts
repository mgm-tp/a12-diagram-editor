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



import { DiagramContainer, resolveContainedElements } from "../diagram/container";
import { Diagram } from "../diagram/diagram";
import { isConnectedEdge } from "../diagram/edge";
import { DiagramNode } from "../diagram/node";
import { isReadonly } from "../state";

export function canAddElementToContainer(
	elementId: string,
	containerId: string,
	readonlyElements: Record<string, boolean>,
	diagram: Diagram
): boolean {
	return (
		!isReadonly(elementId, readonlyElements) &&
		!isReadonly(containerId, readonlyElements) &&
		!createsCycle(elementId, containerId, diagram)
	);
}

export function addElementToContainer(elementId: string, containerId: string, diagram: Diagram): Diagram {
	const element: DiagramNode | DiagramContainer =
		(diagram.nodes[elementId] as DiagramNode | undefined) ?? diagram.containers[elementId];
	const container = diagram.containers[containerId];
	if (element.type === "container") {
		const containedElements = resolveContainedElements(element, diagram);
		if (containedElements.some(e => e.id === containerId)) {
			return diagram;
		}
	}

	const updatedContainer = addElementAndConnectedEdges(element, container, diagram);
	return { ...diagram, containers: { ...diagram.containers, [containerId]: updatedContainer } };
}

function createsCycle(elementId: string, containerId: string, diagram: Diagram): boolean {
	const parentContainer = diagram.containers[containerId];
	const childContainer = diagram.containers[elementId];
	if (!childContainer) {
		return false;
	}
	const containedElements = resolveContainedElements(childContainer, diagram);
	return containedElements.some(e => e.id === parentContainer.id);
}

function addElementAndConnectedEdges(
	element: DiagramNode | DiagramContainer,
	container: DiagramContainer,
	diagram: Diagram
): DiagramContainer {
	const containedSet = new Set(container.children);
	containedSet.add(element.id);

	const connectedEdges = Object.values(diagram.edges)
		.filter(isConnectedEdge)
		.filter(edge => (isConnectedEdge(edge) && edge.sourceNodeId === element.id) || edge.targetNodeId === element.id);

	connectedEdges.forEach(edge => {
		if (containedSet.has(edge.sourceNodeId) && containedSet.has(edge.targetNodeId)) {
			containedSet.add(edge.id);
		}
	});

	return { ...container, children: Array.from(containedSet) };
}
