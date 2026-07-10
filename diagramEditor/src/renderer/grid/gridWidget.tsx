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

import { memo } from "react";

import { useDiagramState } from "../store/stateContext";

const stepSize = 5;
const pointsPerGrid = 10;
const strokeWidth = 0.5;

export const GridWidget = memo(GridWidgetInternal);

export function GridWidgetInternal() {
	const offset = useDiagramState(state => state.ui.offset);
	const zoomLevel = useDiagramState(state => state.ui.zoomLevel);
	const points = createPointGrid();
	return (
		<svg style={{ position: "absolute", overflow: "visible", height: "100%", width: "100%" }}>
			<pattern
				overflow={"visible"}
				id="gridPattern"
				key={"pattern"}
				width={stepSize * pointsPerGrid}
				height={stepSize * pointsPerGrid}
				patternUnits="userSpaceOnUse"
				x={0.5 * stepSize}
				y={0.5 * stepSize}
			>
				{points}
			</pattern>
			<rect
				id="gridPatternRect"
				x={-offset.left / (zoomLevel / 100)}
				y={-offset.top / (zoomLevel / 100)}
				key="rect"
				width={`${100 / (zoomLevel / 100)}%`}
				height={`${100 / (zoomLevel / 100)}%`}
				fill="url(#gridPattern)"
			/>
		</svg>
	);
}

function createPointGrid() {
	const points = [];
	for (let i = 0; i < pointsPerGrid; i++) {
		for (let j = 0; j < pointsPerGrid; j++) {
			if (i === 0 && j === 0) {
				points.push(createCross());
			} else {
				points.push(createSubGridPoint(i, j));
			}
		}
	}

	return points;
}

function createCross(): React.ReactElement {
	const size = strokeWidth * 4;
	return (
		<g key="mainGridCross">
			<filter key={"blurFilterBig"} x="-50%" y="-50%" width="200%" height="200%" id={"blur"}>
				<feGaussianBlur stdDeviation={0.8} />
			</filter>
			<circle
				filter="url(#blur)"
				key={"circle_blur"}
				fill="#D9EBFA"
				cx={0.5 * stepSize}
				cy={0.5 * stepSize}
				r={size * 0.8}
			/>
			<line
				key={"cross_horizontal_line"}
				x1={0.5 * stepSize - size / 2}
				y1={0.5 * stepSize}
				x2={0.5 * stepSize + size / 2}
				y2={0.5 * stepSize}
				stroke="#9FCBF0"
				strokeWidth={strokeWidth}
			/>
			<line
				key={"cross_vertical_line"}
				x1={0.5 * stepSize}
				y1={0.5 * stepSize - size / 2}
				x2={0.5 * stepSize}
				y2={0.5 * stepSize + size / 2}
				stroke="#9FCBF0"
				strokeWidth={strokeWidth}
			/>
		</g>
	);
}

function createSubGridPoint(i: number, j: number) {
	return (
		<g key={`sub-grid-point-${i}-${j}`}>
			<circle
				key={"circle-blur"}
				filter="url(#blurSmall)"
				fill="#D9EBFA"
				cx={0.5 * stepSize + stepSize * i}
				cy={0.5 * stepSize + stepSize * j}
				r={strokeWidth}
			/>
			<rect
				key={"rect"}
				fill="#9FCBF0"
				width={strokeWidth}
				height={strokeWidth}
				x={0.5 * stepSize + stepSize * i - strokeWidth / 2}
				y={0.5 * stepSize - strokeWidth / 2 + stepSize * j}
			/>
		</g>
	);
}
