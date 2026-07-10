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

import {
	getDiagramEdgeById,
	getDiagramEdgeByLabel,
	getDiagramEdges,
	createOrReconnectEdge,
	assertNodesAreConnected,
	assertNodesAreNotConnected
} from "./utils/edgeUtils";
import { getDiagramNodeById } from "./utils/nodeUtils";
import { assertUiState, confirmRemoveDialog, multiSelectElement, setDiagramReadonly } from "./utils/utils";

const diagram = "edgeTests.diagram";

const ids = {
	node1: "node-1",
	node2: "node-2",
	node3: "node-3",
	port1: "node-1-port-1",
	port2: "node-2-port-1",
	port3: "node-3-port-1",
	edge1: "edge-1"
};

describe("Edges", () => {
	before(() => cy.visit(""));
	beforeEach(() => cy.loadDiagram(diagram));

	describe("Edge Operations", () => {
		it("should be possible to create a section using drag and drop", () => {
			getDiagramEdges().should("have.length", 1);
			createOrReconnectEdge(ids.node3, ids.port3, ids.node2, ids.port2);
			getDiagramEdges().should("have.length", 2);
			assertNodesAreConnected(ids.node2, ids.node3);
		});

		it("should be possible to delete an edge", () => {
			getDiagramEdgeById(ids.edge1).click({ force: true });
			cy.contains(".button", "Delete Selected", { matchCase: false }).click();
			confirmRemoveDialog();
			getDiagramEdgeById(ids.edge1).should("not.exist");
		});

		it("should be possible to reconnect an edge using drag and drop", () => {
			createOrReconnectEdge(ids.node1, ids.port1, ids.node3, ids.port3);
			assertNodesAreConnected(ids.node2, ids.node3);
			assertNodesAreNotConnected(ids.node1, ids.node2);
		});
	});

	describe("Labels", () => {
		const edgeEditorSelector = "#edge-properties-editor";
		const textFieldSelector = "[data-role='text-field-input']";

		it("should be possible to add and remove labels", () => {
			getDiagramEdgeById(ids.edge1).click({ force: true });
			cy.get(edgeEditorSelector).find(textFieldSelector).eq(0).type("Middle");
			cy.get(edgeEditorSelector).find(textFieldSelector).eq(1).type("Middle Subtext");
			cy.get(edgeEditorSelector).find(textFieldSelector).eq(2).type("First");
			cy.get(edgeEditorSelector).find(textFieldSelector).eq(3).type("First Subtext");
			getDiagramEdgeByLabel("Middle").should("exist");
			getDiagramEdgeByLabel("Middle Subtext").should("exist");
			getDiagramEdgeByLabel("First").should("exist");
			getDiagramEdgeByLabel("First Subtext").should("exist");
		});
	});

	describe("UI States", () => {
		it("should be selectable", () => {
			getDiagramEdgeById(ids.edge1).should("exist").click({ force: true });
			assertUiState(ui => expect(ui.selectedElements).to.have.key(ids.edge1));
			assertUiState(ui => expect(Object.values(ui.selectedElements)).to.have.length(1));
		});
	});

	describe("Readonly Mode", () => {
		before(() => setDiagramReadonly(true));
		it("should be possible to select multiple elements", () => {
			getDiagramNodeById(ids.node1).click();
			multiSelectElement(ids.edge1);
			assertUiState(ui => {
				expect(ui.selectedElements).to.deep.equal({ [ids.node1]: true, [ids.edge1]: true });
			});
		});
	});
});
