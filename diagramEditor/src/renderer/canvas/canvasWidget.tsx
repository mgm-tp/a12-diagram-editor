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

import type { PropsWithChildren, MouseEvent, WheelEvent, MouseEventHandler } from "react";
import { useMemo, useRef, useState } from "react";

import { useDiagramState } from "../store/stateContext";
import { getDiagramPosition } from "../utils/coordinateConversion";
import { getCanvasPosition } from "../utils/htmlHelper";
import { isLeftMouseKey, isRightMouseKey } from "../utils/inputKeys";
import { useSelectionRectangle } from "../selectionRectangle/selectionRectangleWidget";
import { useCanvasDragging } from "../common/useCanvasDragging";
import { useVector } from "../common/useVector";

import { CanvasContext } from "./canvasContext";
import { useCanvasEventHandlers } from "./canvasEventHandlers";

export function CanvasWidget(props: PropsWithChildren) {
	const onMouseMoveRef = useRef<MouseEventHandler>(undefined);
	const onMouseUpRef = useRef<MouseEventHandler>(undefined);
	const canvasContext: CanvasContext = useMemo(
		() => ({
			setOnMouseMove: fn => (onMouseMoveRef.current = fn),
			setOnMouseUp: fn => (onMouseUpRef.current = fn),
			clear: () => {
				onMouseMoveRef.current = undefined;
				onMouseUpRef.current = undefined;
			}
		}),
		[]
	);

	return (
		<CanvasContext.Provider value={canvasContext}>
			<Canvas onMouseMove={onMouseMoveRef} onMouseUp={onMouseUpRef}>
				{props.children}
			</Canvas>
		</CanvasContext.Provider>
	);
}

interface InternalCanvasProps {
	onMouseMove: React.RefObject<MouseEventHandler | undefined>;
	onMouseUp: React.RefObject<MouseEventHandler | undefined>;
	children?: React.ReactNode;
}

function Canvas(props: InternalCanvasProps) {
	const { onMouseMove, onMouseUp, children } = props;
	const [isDragging, setIsDragging] = useState(false);
	const canvasId = useDiagramState(state => state.canvasId);
	const zoomLevel = useDiagramState(state => state.ui.zoomLevel);
	const offset = useDiagramState(state => state.ui.offset);
	const { addMovementToVector, getVector, subtractCommittedVector, resetVector } = useVector();

	const {
		onCanvasRightMouseDown,
		onCanvasDragged,
		onCanvasDragEnded,
		onCanvasDoubleClicked,
		onCanvasZoomed,
		onCanvasContextMenu
	} = useCanvasEventHandlers();
	const startPanning = useCanvasDragging(onPan, onPanEnd, "right");
	const { startDrawingSelectionRectangle, SelectionRectangle } = useSelectionRectangle(
		onDrawSelection,
		onDrawSelectionEnd
	);

	return (
		<div
			id={canvasId}
			data-type="canvas"
			style={{
				position: "relative",
				cursor: "move",
				overflow: "hidden",
				height: "100%",
				width: "100%",
				backgroundColor: "white"
			}}
			onMouseUp={e => onMouseUp.current?.(e) ?? setIsDragging(false)}
			onMouseMove={e => onMouseMove.current?.(e)}
			onWheel={onMouseWheel}
			onMouseDown={onMouseDown}
			onDoubleClick={onCanvasDoubleClicked}
			onContextMenu={onCanvasContextMenu}
		>
			{children}
			{SelectionRectangle}
		</div>
	);

	function onMouseDown(event: MouseEvent) {
		if (isDragging) {
			return;
		}
		if (isLeftMouseKey(event)) {
			startDrawingSelectionRectangle(event);
		} else if (isRightMouseKey(event)) {
			onCanvasRightMouseDown(event);
			startPanning();
		}
	}

	function onPan(event: MouseEvent) {
		addMovementToVector(event);
		setIsDragging(true);
		const vector = getVector();
		onCanvasDragged(event, vector);
		subtractCommittedVector(vector);
	}

	function onPanEnd() {
		setIsDragging(false);
		onCanvasDragEnded();
		resetVector();
	}

	function onDrawSelection() {
		setIsDragging(true);
	}

	function onDrawSelectionEnd() {
		setIsDragging(false);
	}

	function onMouseWheel(event: WheelEvent) {
		const scrollDelta = event.deltaY;
		const absPoint = { x: event.clientX, y: event.clientY };
		const canvasPosition = getCanvasPosition(canvasId);
		const diagramPosition = getDiagramPosition(canvasPosition, absPoint, offset, zoomLevel);
		onCanvasZoomed(event, scrollDelta, diagramPosition);
	}
}
