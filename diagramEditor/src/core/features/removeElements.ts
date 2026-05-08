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
import { Diagram } from "../diagram/diagram";
import { isConnectedEdge } from "../diagram/edge";
import { DiagramState, isContainer, isReadonly, UIState } from "../state";

/**
 * Removes the elements from the diagram.
 * Readonly elements are not removed.
 * Edges connected to a removed node are also removed (even if readonly).
 * The selectedElements and the readonlyElements of the Ui state are updated.
 * Elements contained in containers are removed if not readonly.
 */
export function removeElements(state: DiagramState, elementIds: string[]): DiagramState {
	const { diagram, ui } = state;
	const { readonlyElements } = ui;

	const targetIds = new Set(elementIds);

	elementIds
		.filter(id => isContainer(id, state.diagram))
		.forEach(id =>
			resolveContainedElements(state.diagram.containers[id], diagram).forEach(child => targetIds.add(child.id))
		);

	const removableIds = resolveRemovableIds(targetIds, readonlyElements);
	resolveConnectedEdges(removableIds, state.diagram).forEach(id => removableIds.add(id));
	const resultDiagram = removeElementsByIds(removableIds, diagram);
	const resultUiState = cleanUpUiState(removableIds, ui);

	return {
		...state,
		diagram: cleanUpContainers(removableIds, resultDiagram),
		ui: resultUiState
	};
}

function resolveRemovableIds(ids: Set<string>, readonlyElements: Record<string, true>): Set<string> {
	const removableIds = Array.from(ids).filter(id => !isReadonly(id, readonlyElements));
	return new Set(removableIds);
}

function resolveConnectedEdges(ids: Set<string>, diagram: Diagram): string[] {
	return Object.values(diagram.edges)
		.filter(isConnectedEdge)
		.filter(edge => ids.has(edge.sourceNodeId) || ids.has(edge.targetNodeId))
		.map(edge => edge.id);
}

function removeElementsByIds(ids: Set<string>, diagram: Diagram): Diagram {
	const { nodes, edges } = diagram;
	const resultNodes = Object.fromEntries(Object.entries(nodes).filter(([id]) => !ids.has(id)));
	const resultEdges = Object.fromEntries(Object.entries(edges).filter(([id]) => !ids.has(id)));
	const resultContainers = Object.fromEntries(Object.entries(diagram.containers).filter(([id]) => !ids.has(id)));

	return { ...diagram, nodes: resultNodes, edges: resultEdges, containers: resultContainers };
}

function cleanUpContainers(ids: Set<string>, diagram: Diagram): Diagram {
	const updatedContainers = { ...diagram.containers };
	Object.values(updatedContainers).forEach(container => {
		updatedContainers[container.id] = {
			...container,
			children: container.children.filter(child => !ids.has(child))
		};
	});
	return { ...diagram, containers: updatedContainers };
}

function cleanUpUiState(ids: Set<string>, uiState: UIState): UIState {
	const { selectedElements, readonlyElements } = uiState;

	const updatedSelectedElements = Object.fromEntries(Object.entries(selectedElements).filter(([id]) => !ids.has(id)));
	const updatedReadonlyElements = Object.fromEntries(Object.entries(readonlyElements).filter(([id]) => !ids.has(id)));
	const updatedBackgroundElements = uiState.backgroundElements.filter(id => !ids.has(id));
	const updatedForegroundElements = uiState.foregroundElements.filter(id => !ids.has(id));

	return {
		...uiState,
		selectedElements: updatedSelectedElements,
		readonlyElements: updatedReadonlyElements,
		backgroundElements: updatedBackgroundElements,
		foregroundElements: updatedForegroundElements
	};
}
