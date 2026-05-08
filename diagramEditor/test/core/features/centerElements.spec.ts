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


import { centerNode } from "../../../src/core/features/centerElements";
import { Diagram } from "../../../src/core/diagram/diagram";
import { DiagramNode } from "../../../src/core/diagram/node";
import { Rectangle } from "../../../src/core/geometry";
import { UIState } from "../../../src/core/state";
import { createNode, createDiagramState } from "../../utils/diagramStateHelper";

describe("centerNode", () => {
	it("should center a node from position (0,0)", () => {
		const diagram = createDiagramWithNode("node1", 0, 0, 100, 80);
		const canvas: Rectangle = { width: 800, height: 600 };
		const result = centerNode("node1", diagram, createUiState(100), canvas);

		expect(result.offset).toEqual({
			left: 350, // 800/2 - 100/2
			top: 260 // 600/2 - 80/2
		});
	});

	it("should center a node from other position", () => {
		const diagram = createDiagramWithNode("node1", 100, 100, 100, 80);
		const canvas: Rectangle = { width: 800, height: 600 };
		const result = centerNode("node1", diagram, createUiState(100), canvas);

		expect(result.offset).toEqual({
			left: 250, // 800/2 - 100/2 - 100
			top: 160 // 600/2 - 80/2 - 100
		});
	});

	it("should handle zoom level 200 (double size)", () => {
		const diagram = createDiagramWithNode("node1", 100, 100, 50, 30);
		const canvas: Rectangle = { width: 800, height: 600 };
		const result = centerNode("node1", diagram, createUiState(200), canvas);

		expect(result.offset).toEqual({
			left: 150, // 800/2 - (50/2 + 100)*2
			top: 70 // 600/2 - (30/2 + 100)*2
		});
	});

	it("should handle zoom level 50 (half size)", () => {
		const diagram = createDiagramWithNode("node1", 100, 100, 50, 30);
		const canvas: Rectangle = { width: 800, height: 600 };
		const result = centerNode("node1", diagram, createUiState(50), canvas);

		expect(result.offset).toEqual({
			left: 337.5, // 800/2 - (50/2 + 100)*0.5
			top: 242.5 // 600/2 - (30/2 + 100)*0.5
		});
	});

	it("should throw error for non-existing node", () => {
		const diagram = createDiagramWithNode("node1", 100, 100, 50, 30);
		const canvas: Rectangle = { width: 800, height: 600 };

		expect(() => centerNode("nonexistent", diagram, createUiState(100), canvas)).toThrow(
			"Node with id nonexistent does not exist"
		);
	});

	it("should not change other UIState properties when centering a node", () => {
		const initialUiState = createUiState(100, { top: 10, left: 10 }, { node1: true }, { node2: true }, true);
		const diagram = createDiagramWithNode("node1", 0, 0, 100, 80);
		const canvas: Rectangle = { width: 800, height: 600 };
		const result = centerNode("node1", diagram, initialUiState, canvas);

		expect(result.offset).not.toEqual(initialUiState.offset); // Offset muss sich ändern
		expect(result.zoomLevel).toEqual(initialUiState.zoomLevel);
		expect(result.selectedElements).toEqual(initialUiState.selectedElements);
		expect(result.readonlyElements).toEqual(initialUiState.readonlyElements);
		expect(result.showGrid).toEqual(initialUiState.showGrid);
		// do not mutate the initial object
		expect(initialUiState.offset).toEqual({ left: 10, top: 10 });
	});
});

function createDiagramWithNode(id: string, x: number, y: number, width: number, height: number): Diagram {
	const node: DiagramNode = createNode({ id, x, y, width, height });
	return createDiagramState({ diagram: { nodes: { [id]: node } } }).diagram;
}

function createUiState(
	zoomLevel: number,
	offset: { left: number; top: number } = { left: 0, top: 0 },
	selectedElements: Record<string, true> = {},
	readonlyElements: Record<string, true> = {},
	showGrid: boolean = false
): UIState {
	return createDiagramState({
		ui: { zoomLevel, offset, selectedElements, readonlyElements, showGrid }
	}).ui;
}
