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


import { memo, SVGAttributes } from "react";
import styled, { css } from "styled-components";

import { activeAndHover } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/base/mixins/_interaction";

import { Anchor, DiagramEdge } from "../../core/diagram/edge";
import { Point, resolveLineOrientation } from "../../core/geometry";

import { isLeftMouseKey } from "../utils/inputKeys";

import { useEdgeEventHandlers } from "./edgeEventHandlers";

type DiagramRendererEdge = DiagramEdge & DiagramEdgeStyle;

interface DiagramEdgeStyle {
	width?: number;
	/**
	 * The width of the interaction area around the edge segment to improve the user experience.
	 */
	interactionWidth?: number;
	color?: string;
	strokeDasharray?: SVGAttributes<SVGLineElement>["strokeDasharray"];
	strokeLinecap?: SVGAttributes<SVGLineElement>["strokeLinecap"];
	sourceArrowHead?: boolean;
	targetArrowHead?: boolean;
}

export interface EdgeWidgetProps {
	edge: DiagramRendererEdge;
	selected: boolean;
	readonly: boolean;
}

export function EdgeWidget(props: EdgeWidgetProps) {
	const { edge } = props;
	const [firstAnchor, secondAnchor] = edge.anchors;
	const [secondLastAnchor, lastAnchor] = edge.anchors.slice(-2);
	return (
		<svg style={{ overflow: "visible" }}>
			{edge.sourceArrowHead && <ArrowHeadWidget {...props} anchor={firstAnchor} neighborAnchor={secondAnchor} />}
			{edge.anchors.map((anchor, index, array) => {
				const nextAnchor = array[index + 1];
				return nextAnchor && <EdgeSegmentWidget key={anchor.id} {...props} anchor1={anchor} anchor2={nextAnchor} />;
			})}
			{edge.anchors.slice(1, -1).map(anchor => (
				<AnchorWidget {...props} key={anchor.id} anchor={anchor} />
			))}
			{edge.targetArrowHead && <ArrowHeadWidget {...props} anchor={lastAnchor} neighborAnchor={secondLastAnchor} />}
		</svg>
	);
}

interface EdgeSegmentProps extends EdgeWidgetProps {
	anchor1: Anchor;
	anchor2: Anchor;
}

const EdgeSegmentWidget = memo(EdgeSegmentWidgetInternal);

function EdgeSegmentWidgetInternal(props: EdgeSegmentProps) {
	const { anchor1, anchor2, edge, selected, readonly } = props;
	const { onEdgeSegmentMouseDown, onEdgeMouseDown } = useEdgeEventHandlers();
	const lineOrientation = resolveLineOrientation({ point1: anchor1, point2: anchor2 });
	const startPoint = calculateStartPoint();
	const endPoint = calculateEndPoint();

	return (
		<>
			<StyledEdgeSegment
				selected={selected}
				readonly={readonly}
				style={{
					color: edge.color,
					width: edge.width,
					strokeDasharray: edge.strokeDasharray,
					strokeLinecap: edge.strokeLinecap
				}}
				x1={startPoint.x}
				y1={startPoint.y}
				x2={endPoint.x}
				y2={endPoint.y}
			/>
			{/* invisible, bigger line to improve the dragability of the line */}
			<line
				id={anchor1.id}
				pointerEvents="all"
				stroke="transparent"
				strokeWidth={edge?.interactionWidth ?? 20}
				x1={startPoint.x}
				y1={startPoint.y}
				x2={endPoint.x}
				y2={endPoint.y}
				onMouseDown={event => {
					if (isLeftMouseKey(event)) {
						event.stopPropagation();
						onEdgeMouseDown(event, edge.id);
						onEdgeSegmentMouseDown(event, edge.id, anchor1.id);
					}
				}}
			/>
		</>
	);

	function calculateStartPoint(): Point {
		// Make first and last segment shorter to properly render arrow heads
		if (!edge.sourceArrowHead || edge.anchors.indexOf(anchor1) !== 0) {
			return anchor1;
		}

		if (lineOrientation === "horizontal") {
			const sign = anchor1.x < anchor2.x ? 1 : -1;
			return { x: anchor1.x + sign * ARROW_HEAD_LENGTH, y: anchor1.y };
		} else if (lineOrientation === "vertical") {
			const sign = anchor1.y < anchor2.y ? 1 : -1;
			return { x: anchor1.x, y: anchor1.y + sign * ARROW_HEAD_LENGTH };
		} else {
			return anchor1;
		}
	}

	function calculateEndPoint(): Point {
		if (!edge.targetArrowHead || edge.anchors.indexOf(anchor2) !== edge.anchors.length - 1) {
			return anchor2;
		}

		if (lineOrientation === "horizontal") {
			const sign = anchor2.x < anchor1.x ? 1 : -1;
			return { x: anchor2.x + sign * ARROW_HEAD_LENGTH, y: anchor2.y };
		} else if (lineOrientation === "vertical") {
			const sign = anchor2.y < anchor1.y ? 1 : -1;
			return { x: anchor2.x, y: anchor2.y + sign * ARROW_HEAD_LENGTH };
		} else {
			return anchor2;
		}
	}
}

const StyledEdgeSegment = styled.line<{ selected: boolean; readonly: boolean; style?: DiagramEdgeStyle }>`
	${props =>
		activeAndHover(css`
			border-color: ${props.theme.components.diagramConfig.node.focusBorderColor};
		`)}
	stroke-width: ${props => props.style?.width ?? 3};
	stroke-dasharray: ${props => props.style?.strokeDasharray};
	stroke-linecap: ${props => props.style?.strokeLinecap};
	stroke: ${props => {
		if (props.readonly) {
			return props.theme.colors.interaction.readonly.color;
		} else if (props.selected) {
			return props.theme.colors.interaction.active.color;
		} else {
			return props.style?.color ?? props.theme.colors.interaction.selected.color;
		}
	}};
`;

interface AnchorWidgetProps extends EdgeWidgetProps {
	anchor: Anchor;
}

function AnchorWidget(props: AnchorWidgetProps) {
	const { anchor, edge } = props;
	const { onEdgeMouseDown, onEdgeAnchorMouseDown } = useEdgeEventHandlers();

	return (
		<>
			<StyledAnchor x={anchor.x - 1.5} y={anchor.y - 1.5} />
			<rect
				x={anchor.x - 3}
				y={anchor.y - 3}
				width={6}
				height={6}
				fill="transparent"
				pointerEvents="all"
				onMouseDown={e => {
					e.stopPropagation();
					if (!isLeftMouseKey(e)) {
						return;
					}
					onEdgeMouseDown(e, edge.id);
					onEdgeAnchorMouseDown(e, edge.id, anchor.id);
				}}
			/>
		</>
	);
}

interface ArrowHeadWidgetProps extends EdgeWidgetProps {
	anchor: Anchor;
	neighborAnchor: Anchor;
}

const ARROW_HEAD_LENGTH = 10;
const ARROW_HEAD_HALF_WIDTH = 4;

function ArrowHeadWidget(props: ArrowHeadWidgetProps) {
	const { anchor, neighborAnchor, selected, readonly } = props;
	const lineOrientation = resolveLineOrientation({ point1: anchor, point2: neighborAnchor });
	let rotation = 0;
	if (lineOrientation === "horizontal") {
		rotation = anchor.x < neighborAnchor.x ? 180 : 0;
	} else if (lineOrientation === "vertical") {
		rotation = anchor.y < neighborAnchor.y ? 270 : 90;
	}

	return (
		<StyledArrowHead
			selected={selected}
			readonly={readonly}
			points={`${props.anchor.x},${props.anchor.y} ${props.anchor.x - ARROW_HEAD_LENGTH},${props.anchor.y - ARROW_HEAD_HALF_WIDTH} ${props.anchor.x - ARROW_HEAD_LENGTH},${props.anchor.y + ARROW_HEAD_HALF_WIDTH}`}
			transform={`rotate(${rotation}, ${props.anchor.x}, ${props.anchor.y})`}
		/>
	);
}

const StyledArrowHead = styled.polygon<{ readonly: boolean; selected: boolean }>`
	fill: ${props => {
		if (props.readonly) {
			return props.theme.colors.interaction.readonly.color;
		} else if (props.selected) {
			return props.theme.colors.interaction.active.color;
		} else {
			return props.style?.color ?? props.theme.colors.interaction.selected.color;
		}
	}};
`;

const StyledAnchor = styled.rect`
	width: 3px;
	height: 3px;
	fill: ${props => props.theme.components.diagramConfig.port.background};
`;
