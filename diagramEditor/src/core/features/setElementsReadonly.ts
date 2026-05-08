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
import { DiagramState, isContainer } from "../state";

export function setElementReadonly(elementId: string, state: DiagramState): DiagramState {
	const result = new Set<string>(Object.keys(state.ui.readonlyElements));
	result.add(elementId);
	if (isContainer(elementId, state.diagram)) {
		const containedElements = resolveContainedElements(state.diagram.containers[elementId], state.diagram);
		containedElements.forEach(e => result.add(e.id));
	}

	return { ...state, ui: { ...state.ui, readonlyElements: toRecord(result) } };
}

export function unsetElementReadonly(elementId: string, state: DiagramState): DiagramState {
	const result = new Set<string>(Object.keys(state.ui.readonlyElements));
	result.delete(elementId);
	if (isContainer(elementId, state.diagram)) {
		const containedElements = resolveContainedElements(state.diagram.containers[elementId], state.diagram);
		containedElements.forEach(e => result.delete(e.id));
	}

	return { ...state, ui: { ...state.ui, readonlyElements: toRecord(result) } };
}

function toRecord(set: Set<string>) {
	const result: Record<string, true> = {};
	set.forEach(id => (result[id] = true));
	return result;
}
