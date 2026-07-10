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

import { assertNodeProperties, getDiagramNodeById, getDiagramNodeByLabel, moveNode } from "./utils/nodeUtils";
import { assertUiState, confirmRemoveDialog, multiSelectElement, setDiagramReadonly } from "./utils/utils";

const diagram = "nodeTests.diagram";

const ids = {
	node1: "node-1",
	node2: "node-2",
	node3: "node-3",
	port1: "node-1-port-1"
};

describe("Nodes", () => {
	before(() => cy.visit(""));
	beforeEach(() => cy.loadDiagram(diagram));

	describe("Node Operations", () => {
		it("should be possible to create a Node", () => {
			getDiagramNodeByLabel("New Node").should("not.exist");
			const dataTransfer = new DataTransfer();
			cy.get("#node-template").trigger("dragstart", { dataTransfer });
			cy.get("#drop-area").trigger("dragover").trigger("drop", { dataTransfer });
			getDiagramNodeByLabel("New Node").should("exist");
		});

		it("should be possible to move a Node", () => {
			assertNodeProperties(ids.node1, node => {
				expect(node.x).to.equal(300);
				expect(node.y).to.equal(500);
			});

			moveNode(ids.node1, -100, -100);

			assertNodeProperties(ids.node1, node => {
				expect(node.x).to.equal(200);
				expect(node.y).to.equal(400);
			});
		});

		it("should be possible to delete a Node", () => {
			getDiagramNodeById(ids.node1).click();
			cy.contains("button", "Delete Selected", { matchCase: false }).click();
			confirmRemoveDialog();
			getDiagramNodeById(ids.node1).should("not.exist");
		});
	});

	describe("Readonly Mode", () => {
		before(() => setDiagramReadonly(true));

		it("should not allow moving nodes", () => {
			assertNodeProperties(ids.node1, node => {
				expect(node.x).to.equal(300);
				expect(node.y).to.equal(500);
			});

			moveNode(ids.node1, -100, -100);

			assertNodeProperties(ids.node1, node => {
				expect(node.x).to.equal(300);
				expect(node.y).to.equal(500);
			});
		});

		it("should allow selecting multiple nodes, but not move them", () => {
			assertNodeProperties(ids.node1, node => {
				expect(node.x).to.equal(300);
				expect(node.y).to.equal(500);
			});
			getDiagramNodeById(ids.node1).click();
			multiSelectElement(ids.node2);
			assertUiState(ui => {
				expect(ui.selectedElements).to.deep.equal({ [ids.node1]: true, [ids.node2]: true });
			});
			moveNode(ids.node1, -100, -100);
			assertNodeProperties(ids.node1, node => {
				expect(node.x).to.equal(300);
				expect(node.y).to.equal(500);
			});
		});

		it("should not render ports, thus disallowing creating or reconnecting edges", () => {
			getDiagramNodeById(ids.node1).click();
			cy.get(ids.node1).should("not.exist");
		});
	});
});
