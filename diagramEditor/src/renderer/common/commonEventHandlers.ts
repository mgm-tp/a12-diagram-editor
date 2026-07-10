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

import type { ResizePointOrientation } from "../../core/features/resizeElement";
import type { Area, Vector } from "../../core/geometry";

import { useCustomEventHandlers } from "../store/configuration/eventHandlers";
import { diagramActions } from "../store/slice";
import { useDiagramDispatch, useDiagramState } from "../store/stateContext";

export interface CommonEventHandlers {
	onMouseMultiselection: (area: Area) => void;
	onMultipleElementsDragged: (event: MouseEvent, draggedElementId: string, vector: Vector) => void;
	onElementResized: (event: MouseEvent, elementId: string, orientation: ResizePointOrientation, vector: Vector) => void;
}

export function useCommonEventHandlers(): CommonEventHandlers {
	const eventHandlers = useDefaultCommonEventHandlers();
	const customEventHandlers = useCustomEventHandlers();
	return { ...eventHandlers, ...customEventHandlers };
}

export function useDefaultCommonEventHandlers(): CommonEventHandlers {
	const readonly = useDiagramState(state => state.ui.readonly);
	const enabledEventHandlers = useEnabledEventHandlers();
	const readonlyEventHandlers = useReadonlyEventHandlers();
	return readonly ? readonlyEventHandlers : enabledEventHandlers;
}

function useEnabledEventHandlers(): CommonEventHandlers {
	const dispatch = useDiagramDispatch();

	return {
		onMultipleElementsDragged: (e, elementId, vector) =>
			dispatch(diagramActions.elementsMoved({ draggedElementId: elementId, vector })),
		onMouseMultiselection: area => dispatch(diagramActions.onMouseMultiselection(area)),
		onElementResized: (event, elementId, orientation, vector) =>
			dispatch(diagramActions.elementResized({ elementId, orientation, vector }))
	};
}

function useReadonlyEventHandlers(): CommonEventHandlers {
	const dispatch = useDiagramDispatch();

	return {
		onMultipleElementsDragged: () => {},
		onElementResized: () => {},
		onMouseMultiselection: area => dispatch(diagramActions.onMouseMultiselection(area))
	};
}
