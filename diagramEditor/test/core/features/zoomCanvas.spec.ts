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


import { applyZoom } from "../../../src/core/features/zoomCanvas";
import { createDiagramState } from "../../utils/diagramStateHelper";

describe("applyZoom", () => {
	describe("no offset and diagram position (0,0)", () => {
		it("should increase zoom level for positive delta and adjust offset", () => {
			const delta = -100;
			const result = applyZoom(delta, uiState, diagramPosition);
			expect(result.zoomLevel).toBeCloseTo(120, 5);
			expect(result.offset).toEqual(uiState.offset);
		});

		it("should decrease zoom level for negative delta and adjust offset", () => {
			const delta = -50;
			const result = applyZoom(delta, uiState, diagramPosition);
			expect(result.zoomLevel).toBeCloseTo(110, 5);
			expect(result.offset).toEqual(uiState.offset);
		});

		it("should not zoom out below 0 and adjust offset", () => {
			const delta = 100000;
			const result = applyZoom(delta, uiState, diagramPosition);
			expect(result.zoomLevel).toBeCloseTo(5, 5);
			expect(result.offset).toEqual(uiState.offset);
		});

		it("should ignore Infinity delta", () => {
			const result = applyZoom(Infinity, uiState, diagramPosition);
			expect(result.zoomLevel).toBe(100);
			expect(result.offset).toEqual(uiState.offset);
		});

		it("should handle fractional zoom changes and adjust offset", () => {
			const delta = 0.5;
			const result = applyZoom(delta, uiState, diagramPosition);
			expect(result.zoomLevel).toBeCloseTo(99.9, 5);
			expect(result.offset).toEqual(uiState.offset);
		});

		it("should preserve other UI state properties", () => {
			const delta = 50;
			const result = applyZoom(delta, uiState, diagramPosition);
			expect(result.selectedElements).toEqual(uiState.selectedElements);
			expect(result.readonlyElements).toEqual(uiState.readonlyElements);
			expect(result.showGrid).toBe(uiState.showGrid);
		});
	});

	describe("different diagram position and offset", () => {
		const customDiagramPosition = { x: 100, y: 100 };
		const customOffset = { top: 50, left: 50 };

		it("should adjust offset based on diagram position", () => {
			const delta = 50;
			const result = applyZoom(delta, uiState, customDiagramPosition);
			expect(result.zoomLevel).toBeCloseTo(90, 5);
			expect(result.offset).toEqual({
				top: 10,
				left: 10
			});
		});

		it("should adjust offset based on diagram position and existing offset ", () => {
			const delta = 50;
			const result = applyZoom(delta, { ...uiState, offset: customOffset }, customDiagramPosition);
			expect(result.zoomLevel).toBeCloseTo(90, 5);
			expect(result.offset).toEqual({
				top: 60,
				left: 60
			});
		});
	});
});

const diagramPosition = { x: 0, y: 0 };

const uiState = createDiagramState({
	ui: {
		offset: { top: 0, left: 0 },
		selectedElements: { node1: true },
		readonlyElements: { node2: true },
		zoomLevel: 100,
		showGrid: false
	}
}).ui;
