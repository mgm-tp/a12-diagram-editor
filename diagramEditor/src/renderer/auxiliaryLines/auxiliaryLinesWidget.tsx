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

import { createSelector } from "@reduxjs/toolkit";

import { calculateAuxiliaryLines } from "../../core/features/auxiliaryLines";
import type { DiagramState } from "../../core/state";
import type { Line } from "../../core/geometry";

import { useDiagramState } from "../store/stateContext";

export function AuxiliaryLinesWidget() {
	const auxiliaryLines = useDiagramState(selectAuxiliaryLines);

	return (
		<svg style={{ overflow: "visible", position: "absolute" }}>
			{auxiliaryLines.map((l, index) => (
				<line
					key={createKey(l, index)}
					stroke="black"
					strokeWidth={0.5}
					strokeDasharray={6}
					x1={l.point1.x}
					y1={l.point1.y}
					x2={l.point2.x}
					y2={l.point2.y}
				/>
			))}
		</svg>
	);
}

function createKey(line: Line, index: number): string {
	return `${line.point1.x},${line.point1.y}-${line.point2.x},${line.point2.y}-${index}`;
}

const selectAuxiliaryLines = createSelector(
	[(state: DiagramState) => state.ui.selectedElements, (state: DiagramState) => state.diagram.nodes],
	(selectedElements, nodes) => {
		const selectedNodes = Object.values(nodes).filter(node => node.id in selectedElements);
		const otherNodes = Object.values(nodes).filter(node => !(node.id in selectedElements));

		return selectedNodes.flatMap(node => {
			return otherNodes.flatMap(otherNode => calculateAuxiliaryLines(node, otherNode));
		});
	}
);
