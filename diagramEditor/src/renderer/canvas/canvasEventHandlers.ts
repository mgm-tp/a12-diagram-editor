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

import type { MouseEvent, WheelEvent } from "react";

import type { Point, Vector } from "../../core/geometry";

import { diagramActions } from "../store/slice";
import { useDiagramDispatch } from "../store/stateContext";
import { useCustomEventHandlers } from "../store/configuration/eventHandlers";

export interface CanvasEventHandlers {
	onCanvasLeftClicked: () => void;
	onCanvasDoubleClicked: (event: MouseEvent) => void;
	onCanvasRightMouseDown: (event: MouseEvent) => void;
	onCanvasDragged: (event: MouseEvent, vector: Vector) => void;
	onCanvasZoomed: (event: WheelEvent, scrollDelta: number, diagramPosition: Point) => void;
	onCanvasDragEnded: () => void;
	onCanvasContextMenu: (event: MouseEvent) => void;
}

export function useCanvasEventHandlers(): CanvasEventHandlers {
	const eventHandlers = useDefaultCanvasEventHandlers();
	const customEventHandlers = useCustomEventHandlers();
	return { ...eventHandlers, ...customEventHandlers };
}

export function useDefaultCanvasEventHandlers(): CanvasEventHandlers {
	const dispatch = useDiagramDispatch();

	return {
		onCanvasLeftClicked: () => dispatch(diagramActions.canvasSelected()),
		onCanvasDoubleClicked: () => {},
		onCanvasRightMouseDown: () => {},
		onCanvasZoomed: (event, scrollDelta, diagramPosition) =>
			dispatch(diagramActions.canvasZoomed({ scrollDelta, diagramPosition })),
		onCanvasDragged: (event, vector) => dispatch(diagramActions.canvasDragged({ vector })),
		onCanvasDragEnded: () => {},
		onCanvasContextMenu: event => {
			event.preventDefault();
		}
	};
}
