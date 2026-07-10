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

import { diagramActions } from "../store/slice";
import { useDiagramDispatch, useDiagramState } from "../store/stateContext";
import { multiSelectKeyPressed } from "../utils/inputKeys";
import { useCustomEventHandlers } from "../store/configuration/eventHandlers";

export interface ContainerEventHandlers {
	onContainerMouseDown: (event: MouseEvent, containerId: string) => void;
	onContainerDoubleClicked: (event: MouseEvent, containerId: string) => void;
	onContainerDragged: (event: MouseEvent, containerId: string, vector: Vector) => void;
	onContainerDragEnded: (event: MouseEvent, containerId: string) => void;
	onElementsAddedToContainer: (event: MouseEvent, elementIds: string[], containerId: string) => void;
	onElementsRemovedFromContainer: (event: MouseEvent, elementIds: string[], containerId: string) => void;
}

export function useContainerEventHandlers(): ContainerEventHandlers {
	const eventHandlers = useDefaultContainerEventHandlers();
	const customEventHandlers = useCustomEventHandlers();
	return { ...eventHandlers, ...customEventHandlers };
}

export function useDefaultContainerEventHandlers(): ContainerEventHandlers {
	const readonly = useDiagramState(state => state.ui.readonly);
	const readonlyEventHandlers = useReadonlyEventHandlers();
	const enabledEventHandlers = useEnabledContainerEventHandlers();
	return readonly ? readonlyEventHandlers : enabledEventHandlers;
}

function useEnabledContainerEventHandlers(): ContainerEventHandlers {
	const dispatch = useDiagramDispatch();

	return {
		onContainerMouseDown: (event, containerId) => {
			if (multiSelectKeyPressed(event)) {
				dispatch(diagramActions.elementMultiSelected({ elementId: containerId }));
			} else {
				dispatch(diagramActions.elementSelected({ elementId: containerId }));
			}
		},
		onContainerDoubleClicked: () => {},
		onContainerDragged: (event, containerId, vector) =>
			dispatch(diagramActions.containerMoved({ containerId, vector })),
		onContainerDragEnded: () => dispatch(diagramActions.dragEnded()),
		onElementsAddedToContainer: (event, elementIds, containerId) =>
			dispatch(diagramActions.elementsAddedToContainer({ elementIds, containerId })),
		onElementsRemovedFromContainer: (event, elementIds, containerId) =>
			dispatch(diagramActions.elementsRemovedFromContainer({ elementIds, containerId }))
	};
}

function useReadonlyEventHandlers(): ContainerEventHandlers {
	const dispatch = useDiagramDispatch();

	return {
		onContainerMouseDown: (event, containerId) => {
			if (multiSelectKeyPressed(event)) {
				dispatch(diagramActions.elementMultiSelected({ elementId: containerId }));
			} else {
				dispatch(diagramActions.elementSelected({ elementId: containerId }));
			}
		},
		onContainerDoubleClicked: () => {},
		onContainerDragged: () => {},
		onContainerDragEnded: () => {},
		onElementsAddedToContainer: () => {},
		onElementsRemovedFromContainer: () => {}
	};
}
