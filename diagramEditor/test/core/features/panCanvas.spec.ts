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



import { panCanvas } from "../../../src/core/features/panCanvas";
import { UIState } from "../../../src/core/state";
import { Vector } from "../../../src/core/geometry";
import { createDiagramState } from "../../utils/diagramStateHelper";

describe("panCanvas", () => {
	it("should pan canvas by positive vector", () => {
		const initialState = createUIState(0, 0);
		const vector: Vector = { x: 100, y: 50 };
		const result = panCanvas(vector, initialState);

		expect(result.offset).toEqual({ top: 50, left: 100 });
	});

	it("should pan canvas by negative vector", () => {
		const initialState = createUIState(100, 100);
		const vector: Vector = { x: -150, y: -200 };
		const result = panCanvas(vector, initialState);

		expect(result.offset).toEqual({ top: -100, left: -50 });
	});

	it("should handle zero vector", () => {
		const initialState = createUIState(50, 50);
		const vector: Vector = { x: 0, y: 0 };
		const result = panCanvas(vector, initialState);

		expect(result.offset).toEqual({ top: 50, left: 50 });
	});

	it("should preserve other UI state properties", () => {
		const initialState: UIState = createDiagramState().ui;
		const vector: Vector = { x: 100, y: 100 };
		const result = panCanvas(vector, initialState);

		const expectedOffSet = { top: 100, left: 100 };
		const expectedState = {
			...initialState,
			offset: expectedOffSet
		};

		expect(result).toEqual(expectedState);
	});
});

function createUIState(top: number, left: number): UIState {
	return createDiagramState({ ui: { offset: { top, left } } }).ui;
}
