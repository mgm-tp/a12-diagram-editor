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



import { assertUiState, getCanvas, getSelectionRectangle, panCanvas, setDiagramReadonly } from "./utils/utils";

describe("Canvas", () => {
	beforeEach(() => {
		cy.visit("");
	});

	it("should be able to toggle Grid", () => {
		cy.get("[id=gridPattern]").should("exist");
		checkRectStartPosition("x");
		checkRectStartPosition("y");

		cy.contains("[data-role=switch]", "Grid").find("input").uncheck();
		cy.get("[id=gridPattern]").should("not.exist");
		cy.contains("[data-role=switch]", "Grid").find("input").check();
		cy.get("[id=gridPattern]").should("exist");
	});

	it("should pan canvas when right click and move on empty canvas area", () => {
		assertUiState(initialUiState => {
			expect(initialUiState.offset.left).to.equal(0);
			expect(initialUiState.offset.top).to.equal(0);
		});

		panCanvas(1, 1);

		assertUiState(finalUi => {
			expect(finalUi.offset.left).to.not.equal(0);
			expect(finalUi.offset.top).to.not.equal(0);
		});
	});

	it("should select elements within selection area", () => {
		getCanvas()
			.trigger("mousedown", { button: 0, clientX: 0, clientY: 0 })
			.trigger("mousemove", { clientX: 0, clientY: 0 }) // implementation requires that at least two mouse moves are fired
			.trigger("mousemove", { clientX: 900, clientY: 800 });

		getSelectionRectangle().should("exist");
		getCanvas().trigger("mouseup", { button: 0 });
		getSelectionRectangle().should("not.exist");

		assertUiState(finalUi => {
			expect(finalUi.selectedElements).to.include.all.keys(["node-3", "node-14", "74"]);
		});

		getCanvas().trigger("mousedown", { button: 0, clientX: 0, clientY: 0 }).trigger("mouseup", { button: 0 });

		assertUiState(finalUi => {
			expect(finalUi.selectedElements).to.deep.equal({});
		});
	});

	describe("Readonly Mode", () => {
		beforeEach(() => {
			setDiagramReadonly(true);
		});

		it("should allow panning the canvas", () => {
			assertUiState(initialUiState => {
				expect(initialUiState.offset.left).to.equal(0);
				expect(initialUiState.offset.top).to.equal(0);
			});

			panCanvas(1, 1);

			assertUiState(finalUiState => {
				expect(finalUiState.offset.left).to.not.equal(0);
				expect(finalUiState.offset.top).to.not.equal(0);
			});
		});

		it("should allow zooming the canvas", () => {
			getCanvas().trigger("wheel", { deltaY: -100 });
			assertUiState(ui => {
				expect(ui.zoomLevel).to.not.equal(100);
			});
		});
	});
});

function checkRectStartPosition(coordinate: "x" | "y") {
	cy.get("[id=gridPatternRect]")
		.invoke("attr", coordinate)
		.then(coordinate => {
			cy.wrap(Number(coordinate)).should("not.be.NaN");
		});
}
