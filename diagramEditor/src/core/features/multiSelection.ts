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



import { isEdgeContainedInArea } from "../diagram/edge";
import { Diagram } from "../diagram/diagram";
import { Area, isRectangleContainedInArea } from "../geometry";

export function toggleSelectedElement(selectedElements: Record<string, true>, elementId: string): Record<string, true> {
	if (selectedElements[elementId]) {
		const { [elementId]: _, ...newSelection } = selectedElements;
		return newSelection;
	} else {
		return { ...selectedElements, [elementId]: true };
	}
}

export function selectElementsInArea(diagram: Diagram, selectedArea: Area): Record<string, true> {
	const newSelection: Record<string, true> = {};
	for (const node of Object.values(diagram.nodes)) {
		if (isRectangleContainedInArea(node, selectedArea)) {
			newSelection[node.id] = true;
		}
	}
	for (const edge of Object.values(diagram.edges)) {
		if (isEdgeContainedInArea(edge, selectedArea)) {
			newSelection[edge.id] = true;
		}
	}
	for (const container of Object.values(diagram.containers)) {
		if (isRectangleContainedInArea(container, selectedArea)) {
			newSelection[container.id] = true;
		}
	}
	return newSelection;
}
