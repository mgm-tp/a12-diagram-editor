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

import styled from "styled-components";
import type { MouseEvent } from "react";
import { useState } from "react";

import type { Point, Rectangle } from "../../core/geometry";
import { getAreaFromPoints } from "../../core/geometry";

import { getDiagramPosition, getRelativePosition } from "../utils/coordinateConversion";
import { useDiagramState } from "../store/stateContext";
import type { MouseEventHandler } from "../utils/htmlHelper";
import { getCanvasPosition } from "../utils/htmlHelper";
import { useCanvasDragging } from "../common/useCanvasDragging";
import { useCommonEventHandlers } from "../common/commonEventHandlers";

interface SelectionRectangleProps {
	p1: Point;
	p2: Point;
}

function SelectionRectangleWidget(props: SelectionRectangleProps) {
	const canvasId = useDiagramState(state => state.canvasId);
	const { p1, p2 } = props;
	const { topLeft, rectangle } = getAreaFromPoints(p1, p2);
	const relTopLeft = getRelativePosition(topLeft, getCanvasPosition(canvasId));

	return (
		<svg style={{ position: "absolute", overflow: "visible" }}>
			<StyledSelectionRectangleWidget
				data-type="selection-rectangle"
				relTopLeft={relTopLeft}
				rectangle={rectangle}
				x={relTopLeft.x}
				y={relTopLeft.y}
				width={rectangle.width}
				height={rectangle.height}
			/>
		</svg>
	);
}

interface StyledSelectionRectangleWidgetProps {
	relTopLeft: Point;
	rectangle: Rectangle;
}

const StyledSelectionRectangleWidget = styled.rect<StyledSelectionRectangleWidgetProps>`
	opacity: 0.3;
	fill: ${props => props.theme.colors.interaction.primaryInteractionColor};
`;

export function useSelectionRectangle(onDrag: MouseEventHandler, onDragEnd: MouseEventHandler) {
	const [startPoint, setStartPoint] = useState<Point | undefined>(undefined);
	const [endPoint, setEndPoint] = useState<Point | undefined>(undefined);
	const startDragging = useCanvasDragging(onMouseMove, onMouseUp);

	const { onMouseMultiselection } = useCommonEventHandlers();
	const canvasId = useDiagramState(state => state.canvasId);
	const offset = useDiagramState(state => state.ui.offset);
	const zoomLevel = useDiagramState(state => state.ui.zoomLevel);

	return {
		startDrawingSelectionRectangle: (e: MouseEvent) => {
			setStartPoint({ x: e.clientX, y: e.clientY });
			startDragging();
		},
		SelectionRectangle: startPoint && endPoint && <SelectionRectangleWidget p1={startPoint} p2={endPoint} />
	};

	function onMouseMove(event: MouseEvent) {
		if (!startPoint) {
			return;
		}
		const endPoint = { x: event.clientX, y: event.clientY };
		setEndPoint(endPoint);
		onDrag(event);

		const canvasPosition = getCanvasPosition(canvasId);
		const startDiagramPosition = getDiagramPosition(canvasPosition, startPoint, offset, zoomLevel);
		const endDiagramPosition = getDiagramPosition(canvasPosition, endPoint, offset, zoomLevel);

		onMouseMultiselection(getAreaFromPoints(startDiagramPosition, endDiagramPosition));
	}

	function onMouseUp(event: MouseEvent) {
		setStartPoint(undefined);
		setEndPoint(undefined);
		onDragEnd(event);
	}
}
