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


import { useEffect, useState } from "react";
import styled from "styled-components";

import { DiagramLabel } from "@com.mgmtp.a12.widgets/widgets-core/lib/model-graph-diagram/main/label.view";

import {
	Anchor,
	ConnectedDiagramEdge,
	EdgeEndLabels,
	EdgeLabel,
	UnconnectedDiagramEdge,
	calculateEdgeMiddlePoint
} from "../../core/diagram/edge";
import { resolvePortOrientation, PortOrientation } from "../../core/diagram/port";
import { Point, Rectangle } from "../../core/geometry";
import { DiagramState } from "../../core/state";

import { useDiagramState } from "../store/stateContext";
import { isLeftMouseKey } from "../utils/inputKeys";

import { AbstractEdgeLabelWidget } from "./abstractEdgeLabelWidget";
import { EdgeLabelWidgetMap } from "./edgeLabelWidgetMap";
import { useEdgeEventHandlers } from "./edgeEventHandlers";

interface EdgeLabelsProps {
	edge: ConnectedDiagramEdge | UnconnectedDiagramEdge;
	edgeLabelWidgetMap: EdgeLabelWidgetMap;
}

export function EdgeLabelsWidget(props: EdgeLabelsProps) {
	const { edge, edgeLabelWidgetMap } = props;

	return (
		<>
			{edge.sourceNodeId && edge.sourcePortId && edge.labels?.start && (
				<EndLabels
					orientation="start"
					edgeId={edge.id}
					nodeId={edge.sourceNodeId}
					portId={edge.sourcePortId}
					anchor={edge.anchors[0]}
					labels={edge.labels.start}
					edgeLabelWidgetMap={edgeLabelWidgetMap}
				/>
			)}
			{edge.labels?.middle && <MiddleLabel edge={edge} edgeLabelWidgetMap={edgeLabelWidgetMap} />}
			{edge.targetNodeId && edge.targetPortId && edge.labels?.end && (
				<EndLabels
					orientation="end"
					edgeId={edge.id}
					nodeId={edge.targetNodeId}
					portId={edge.targetPortId}
					anchor={edge.anchors[edge.anchors.length - 1]}
					labels={edge.labels.end}
					edgeLabelWidgetMap={edgeLabelWidgetMap}
				/>
			)}
		</>
	);
}

interface MiddleLabelProps {
	edge: ConnectedDiagramEdge | UnconnectedDiagramEdge;
	edgeLabelWidgetMap: EdgeLabelWidgetMap;
}

function MiddleLabel(props: MiddleLabelProps) {
	const { edge, edgeLabelWidgetMap } = props;
	// Using the real width and height of the label to position it correctly
	const [divElement, setDivElement] = useState<HTMLDivElement | null>(null);
	const { onEdgeSegmentMouseDown } = useEdgeEventHandlers();
	useResizeObserver(divElement);

	const position = calculateEdgeMiddlePoint(edge);
	const anchor = edge.anchors[position.segmentIndex];
	const width = divElement?.clientWidth ?? 0;
	const height = divElement?.clientHeight ?? 0;

	return (
		<LabelWrapper
			ref={ref => setDivElement(ref)}
			style={{ left: position.x - width / 2, top: position.y - height / 2 }}
			onMouseDown={e => {
				if (!isLeftMouseKey(e)) {
					return;
				} else {
					e.stopPropagation();
				}
				onEdgeSegmentMouseDown(e, edge.id, anchor.id);
			}}
		>
			{edge.labels?.middle && (
				<AbstractEdgeLabelWidget
					edgeId={edge.id}
					label={edge.labels?.middle}
					position="middle"
					edgeLabelWidgetMap={edgeLabelWidgetMap}
				/>
			)}
		</LabelWrapper>
	);
}

interface EndLabelsProps {
	edgeId: string;
	nodeId: string;
	portId: string;
	anchor: Anchor;
	labels: EdgeEndLabels;
	orientation: "start" | "end";
	edgeLabelWidgetMap: EdgeLabelWidgetMap;
}

function EndLabels(props: EndLabelsProps) {
	const { edgeId, nodeId, portId, anchor, labels, edgeLabelWidgetMap, orientation } = props;
	// Using the real width and height of the labels to position them correctly
	const [firstDivElement, setFirstDivElement] = useState<HTMLDivElement | null>(null);
	const [secondDivElement, setSecondDivElement] = useState<HTMLDivElement | null>(null);
	const portOrientation = useDiagramState(selectPortOrientation(nodeId, portId));
	useResizeObserver(firstDivElement);
	useResizeObserver(secondDivElement);

	if (!portOrientation || !labels) {
		return null;
	}

	const firstRect = { width: firstDivElement?.clientWidth ?? 0, height: firstDivElement?.clientHeight ?? 0 };
	const secondRect = { width: secondDivElement?.clientWidth ?? 0, height: secondDivElement?.clientHeight ?? 0 };
	const firstPosition = calculateLabelPositions(anchor, portOrientation, firstRect, -20);
	const secondPosition = calculateLabelPositions(anchor, portOrientation, secondRect, 20);

	return (
		<>
			<LabelWrapper ref={ref => setFirstDivElement(ref)} style={{ left: firstPosition.x, top: firstPosition.y }}>
				{labels.first && (
					<AbstractEdgeLabelWidget
						edgeId={edgeId}
						edgeLabelWidgetMap={edgeLabelWidgetMap}
						label={labels.first}
						position={orientation === "start" ? "start-first" : "end-first"}
					/>
				)}
			</LabelWrapper>
			<LabelWrapper ref={ref => setSecondDivElement(ref)} style={{ left: secondPosition.x, top: secondPosition.y }}>
				{labels.second && (
					<AbstractEdgeLabelWidget
						edgeId={edgeId}
						edgeLabelWidgetMap={edgeLabelWidgetMap}
						label={labels.second}
						position={orientation === "start" ? "start-second" : "end-second"}
					/>
				)}
			</LabelWrapper>
		</>
	);
}

export interface EdgeLabelWidgetProps {
	edgeId: string;
	label: EdgeLabel;
	readonly: boolean;
	position: "start-first" | "start-second" | "middle" | "end-first" | "end-second";
}

export function DefaultEdgeLabelWidget(props: EdgeLabelWidgetProps) {
	const { label, position, readonly } = props;
	return (
		<DiagramLabel
			type={position === "middle" ? "main" : "sub"}
			text={label.text}
			subText={label.subText}
			readOnly={readonly}
		/>
	);
}

function calculateLabelPositions(anchor: Anchor, portOrientation: string, labelRect: Rectangle, offset: number): Point {
	const padding = 4;
	const sign = Math.sign(offset);
	const centeredPosition = { x: anchor.x - labelRect.width / 2, y: anchor.y - labelRect.height / 2 };

	if (portOrientation === "top") {
		return {
			x: centeredPosition.x + (sign * labelRect.width) / 2 - (sign * labelRect.height) / 2 + offset,
			y: centeredPosition.y - labelRect.height / 2 - padding
		};
	} else if (portOrientation === "bottom") {
		return {
			x: centeredPosition.x + (sign * labelRect.width) / 2 - (sign * labelRect.height) / 2 + offset,
			y: centeredPosition.y + labelRect.height / 2 + padding
		};
	} else if (portOrientation === "left") {
		return { x: centeredPosition.x - labelRect.width / 2 - padding, y: centeredPosition.y + offset };
	} else {
		return {
			x: centeredPosition.x + labelRect.width / 2 + padding,
			y: centeredPosition.y - offset
		};
	}
}

function useResizeObserver(element: Element | null) {
	const [, setBool] = useState(false);
	const forceRerender = () => setBool(b => !b);

	useEffect(() => {
		const observer = new ResizeObserver(() => forceRerender());
		if (element) {
			observer.observe(element);
		}

		return () => observer.disconnect();
	}, [element]);
}

function selectPortOrientation(nodeId: string, portId: string) {
	return (state: DiagramState): PortOrientation | undefined => {
		const node = state.diagram.nodes[nodeId];
		const port = node.ports[portId];
		return resolvePortOrientation(node, port);
	};
}

const LabelWrapper = styled.div`
	position: absolute;
	user-select: none;
`;
