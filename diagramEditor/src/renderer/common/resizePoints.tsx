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

import type { DiagramElement } from "../../core/diagram/diagramElement";
import type { ResizePointOrientation } from "../../core/features/resizeElement";
import type { Offset, Rectangle, Vector } from "../../core/geometry";

import { useCanvasContext } from "../canvas/canvasContext";

import { useStepSizedVector } from "./useVector";
import { useCommonEventHandlers } from "./commonEventHandlers";

type ResizeFn = (
	event: React.MouseEvent,
	elementId: string,
	orientation: ResizePointOrientation,
	vector: Vector
) => void;

interface ResizePointsProps {
	element: DiagramElement & Rectangle;
}

export function ResizePoints(props: ResizePointsProps) {
	return (
		<>
			<SingleResizePoint {...props} orientation="top-left" />
			<SingleResizePoint {...props} orientation="top" />
			<SingleResizePoint {...props} orientation="top-right" />
			<SingleResizePoint {...props} orientation="left" />
			<SingleResizePoint {...props} orientation="right" />
			<SingleResizePoint {...props} orientation="bottom-left" />
			<SingleResizePoint {...props} orientation="bottom" />
			<SingleResizePoint {...props} orientation="bottom-right" />
		</>
	);
}

interface SingleResizePointProps extends ResizePointsProps {
	orientation: ResizePointOrientation;
}

export function SingleResizePoint(props: SingleResizePointProps) {
	const { element, orientation } = props;
	const { onElementResized } = useCommonEventHandlers();
	const startResize = useResize(element, orientation, onElementResized);
	const offset = resolveOffset(orientation, element);

	return (
		<StyledResizePoint
			orientation={orientation}
			offset={offset}
			onMouseDown={e => {
				startResize();
				e.stopPropagation();
			}}
		/>
	);
}

const StyledResizePoint = styled.div.attrs<{ orientation: ResizePointOrientation; offset: Offset }>(props => ({
	style: {
		left: `${props.offset.left - 2.5}px`,
		top: `${props.offset.top - 2.5}px`
	}
}))`
	cursor: ${props => resolveCursor(props.orientation)};
	position: absolute;
	width: 5px;
	height: 5px;
	background-color: ${props => props.theme.colors.highlightColor};
`;

function resolveCursor(orientation: ResizePointOrientation): string {
	switch (orientation) {
		case "top-left":
		case "bottom-right":
			return "nwse-resize";
		case "top-right":
		case "bottom-left":
			return "nesw-resize";
		case "left":
		case "right":
			return "ew-resize";
		case "top":
		case "bottom":
			return "ns-resize";
	}
}

function resolveOffset(orientation: ResizePointOrientation, rectangle: Rectangle): Offset {
	switch (orientation) {
		case "top-left":
			return { left: 0, top: 0 };
		case "top-right":
			return { left: rectangle.width, top: 0 };
		case "bottom-left":
			return { left: 0, top: rectangle.height };
		case "bottom-right":
			return { left: rectangle.width, top: rectangle.height };
		case "left":
			return { left: 0, top: rectangle.height / 2 };
		case "right":
			return { left: rectangle.width, top: rectangle.height / 2 };
		case "top":
			return { left: rectangle.width / 2, top: 0 };
		case "bottom":
			return { left: rectangle.width / 2, top: rectangle.height };
	}
}

function useResize(element: DiagramElement, orientation: ResizePointOrientation, onDrag: ResizeFn) {
	const canvasContext = useCanvasContext();
	const { addMovementToVector, getVector, resetVector, subtractCommittedVector } = useStepSizedVector();

	return () => {
		canvasContext.setOnMouseMove(event => {
			addMovementToVector(event);

			const vector = getVector();
			if (vector.x === 0 && vector.y === 0) {
				return;
			}

			onDrag(event, element.id, orientation, vector);
			subtractCommittedVector(vector);
		});

		canvasContext.setOnMouseUp(() => {
			canvasContext.clear();
			resetVector();
		});
	};
}
