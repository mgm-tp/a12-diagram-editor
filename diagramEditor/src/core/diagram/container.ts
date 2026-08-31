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

import type { LayoutSettings } from "../features/layoutStateManager";
import type { Point, Rectangle } from "../geometry";
import { generateId } from "../generateId";

import type { PortDistribution, PortMap } from "./port";
import { generatePorts } from "./port";
import type { DiagramElement } from "./diagramElement";
import type { Diagram } from "./diagram";

export const DEFAULT_CONTAINER_TYPE = "container";

// Position of container specifies the coordinate of the left top corner
export interface DiagramContainer extends DiagramElement, Point, Rectangle, LayoutSettings {
	type: typeof DEFAULT_CONTAINER_TYPE;
	label: string;
	ports: PortMap;
	children: string[];
}

export function isDiagramContainer(element: DiagramElement): element is DiagramContainer {
	return element.type === DEFAULT_CONTAINER_TYPE;
}

export function createDiagramContainer(
	partialContainer: Partial<DiagramContainer> = {},
	portDistribution?: PortDistribution
): DiagramContainer {
	const {
		id = generateId("container"),
		type = DEFAULT_CONTAINER_TYPE,
		customType = undefined,
		x = 0,
		y = 0,
		label = "",
		width = 160,
		height = 80,
		ports = {},
		children = [],
		rankdir = undefined,
		align = undefined
	} = partialContainer;

	const container = { id, type, x, y, width, height, label, ports, children, customType, rankdir, align };
	const generatedPorts = portDistribution ? generatePorts(container, 4, portDistribution) : ports;
	return { ...container, ports: generatedPorts };
}

export function resolveContainedElements(container: DiagramContainer, diagram: Diagram): DiagramElement[] {
	const result = container.children.map(
		id => (diagram.nodes[id] ?? diagram.edges[id] ?? diagram.containers[id]) as DiagramElement
	);

	result.filter(isDiagramContainer).forEach(subContainer => {
		result.push(...resolveContainedElements(subContainer, diagram));
	});

	return result;
}
