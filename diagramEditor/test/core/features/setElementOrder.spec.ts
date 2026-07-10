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

import { moveElementToBackground, moveElementToForeground } from "../../../src/core/features/setElementOrder";
import type { UIState } from "../../../src/core/state";
import { createDiagramState } from "../../utils/diagramStateHelper";

describe("setElementOrder", () => {
	describe("moveElementToBackground", () => {
		it("should move element from foreground to background", () => {
			const uiState = createUiState(["element1", "element2"], ["element3"]);

			const result = moveElementToBackground("element1", uiState);

			expect(result.backgroundElements).toEqual(["element3", "element1"]);
			expect(result.foregroundElements).toEqual(["element2"]);
		});

		it("should move element to end of background list when already in background", () => {
			const uiState = createUiState([], ["element1", "element2", "element3"]);

			const result = moveElementToBackground("element2", uiState);

			expect(result.backgroundElements).toEqual(["element1", "element3", "element2"]);
			expect(result.foregroundElements).toEqual([]);
		});

		it("should handle empty background and foreground lists", () => {
			const uiState = createUiState([], []);

			const result = moveElementToBackground("element1", uiState);

			expect(result.backgroundElements).toEqual(["element1"]);
			expect(result.foregroundElements).toEqual([]);
		});
	});

	describe("moveElementToForeground", () => {
		it("should move element from background to foreground", () => {
			const uiState = createUiState(["element3"], ["element1", "element2"]);

			const result = moveElementToForeground("element1", uiState);

			expect(result.foregroundElements).toEqual(["element3", "element1"]);
			expect(result.backgroundElements).toEqual(["element2"]);
		});

		it("should move element to end of foreground list when already in foreground", () => {
			const uiState = createUiState(["element1", "element2", "element3"], []);

			const result = moveElementToForeground("element2", uiState);

			expect(result.foregroundElements).toEqual(["element1", "element3", "element2"]);
			expect(result.backgroundElements).toEqual([]);
		});

		it("should handle empty background and foreground lists", () => {
			const uiState = createUiState([], []);

			const result = moveElementToForeground("element1", uiState);

			expect(result.foregroundElements).toEqual(["element1"]);
			expect(result.backgroundElements).toEqual([]);
		});
	});
});

function createUiState(foregroundElements: string[] = [], backgroundElements: string[] = []): UIState {
	return createDiagramState({
		ui: {
			backgroundElements,
			foregroundElements
		}
	}).ui;
}
