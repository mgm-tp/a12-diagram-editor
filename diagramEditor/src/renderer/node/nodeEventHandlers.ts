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

import type { MouseEvent } from "react";

import type { Vector } from "../../core/geometry";
import { isNode } from "../../core/state";

import { useElementDragging } from "../common/useElementDragging";
import { useDefaultContainerEventHandlers } from "../container/containerEventHandlers";
import { diagramActions } from "../store/slice";
import { useDiagramDispatch, useDiagramState, useDiagramStateWithoutRerendering } from "../store/stateContext";
import { multiSelectKeyPressed } from "../utils/inputKeys";
import { useCustomEventHandlers } from "../store/configuration/eventHandlers";

export interface NodeEventHandlers {
	onNodeMouseDown: (event: MouseEvent, nodeId: string, currentContainerId: string | undefined) => void;
	onNodeDoubleClicked: (event: MouseEvent, nodeId: string) => void;
	onNodeRightMouseDown: (event: MouseEvent, nodeId: string) => void;
	onNodeDragged: (event: MouseEvent, nodeId: string, vector: Vector) => void;
	onNodeDragEnded: (event: MouseEvent, nodeId: string) => void;
}
export function useNodeEventHandlers(): NodeEventHandlers {
	const eventHandlers = useDefaultNodeEventHandlers();
	const customEventHandlers = useCustomEventHandlers();
	return { ...eventHandlers, ...customEventHandlers };
}

export function useDefaultNodeEventHandlers(): NodeEventHandlers {
	const readonly = useDiagramState(state => state.ui.readonly);
	const readonlyEventHandlers = useReadonlyEventHandlers();
	const enabledEventHandlers = useEnabledEventHandlers();

	return readonly ? readonlyEventHandlers : enabledEventHandlers;
}

function useEnabledEventHandlers(): NodeEventHandlers {
	const dispatch = useDiagramDispatch();
	const startDragging = useElementDragging();
	const multiSelected = useDiagramState(state => Object.keys(state.ui.selectedElements).length > 1);
	const getSelectedNodeIds = useDiagramStateWithoutRerendering(state =>
		Object.keys(state.ui.selectedElements).filter(id => isNode(id, state.diagram))
	);
	const { onElementsAddedToContainer, onElementsRemovedFromContainer } = useDefaultContainerEventHandlers();

	const onNodeDragged: NodeEventHandlers["onNodeDragged"] = (_event, nodeId, vector) => {
		dispatch(diagramActions.singleNodeMoved({ nodeId, vector }));
	};
	const onNodeDragEnded: NodeEventHandlers["onNodeDragEnded"] = () => {
		dispatch(diagramActions.dragEnded());
	};

	const onMultipleElementsDragged = (e: MouseEvent, elementId: string, vector: Vector) =>
		dispatch(diagramActions.elementsMoved({ draggedElementId: elementId, vector }));

	return {
		onNodeMouseDown: (event, nodeId, currentContainerId) => {
			if (multiSelectKeyPressed(event)) {
				dispatch(diagramActions.elementMultiSelected({ elementId: nodeId }));
			} else {
				dispatch(diagramActions.elementSelected({ elementId: nodeId }));
			}

			startDragging({
				elementId: nodeId,
				onDrag: (event, vector) =>
					multiSelected ? onMultipleElementsDragged(event, nodeId, vector) : onNodeDragged(event, nodeId, vector),
				onDragEnd: event => {
					const selectedNodeIds = getSelectedNodeIds();
					const elements = document.elementsFromPoint(event.clientX, event.clientY);
					const targetContainer = elements.find(el => el.getAttribute("data-type") === "container");
					if (targetContainer && targetContainer.id !== currentContainerId) {
						if (currentContainerId) {
							onElementsRemovedFromContainer(event, selectedNodeIds, currentContainerId);
						}
						onElementsAddedToContainer(event, selectedNodeIds, targetContainer.id);
					} else if (!targetContainer && currentContainerId) {
						onElementsRemovedFromContainer(event, selectedNodeIds, currentContainerId);
					}
					onNodeDragEnded(event, nodeId);
				}
			});
		},
		onNodeDoubleClicked: () => {},
		onNodeRightMouseDown: () => {},
		onNodeDragged,
		onNodeDragEnded
	};
}

function useReadonlyEventHandlers(): NodeEventHandlers {
	const dispatch = useDiagramDispatch();

	return {
		onNodeMouseDown: (event, nodeId) => {
			if (multiSelectKeyPressed(event)) {
				dispatch(diagramActions.elementMultiSelected({ elementId: nodeId }));
			} else {
				dispatch(diagramActions.elementSelected({ elementId: nodeId }));
			}
		},
		onNodeDoubleClicked: () => {},
		onNodeRightMouseDown: () => {},
		onNodeDragged: () => {},
		onNodeDragEnded: () => {}
	};
}
