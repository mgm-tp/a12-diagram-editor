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


import { getDiagramNodeById, moveNode, multiSelectNode } from "./utils/nodeUtils";
import { assertUiState } from "./utils/utils";
import { assertContainerProperties } from "./utils/containerUtils";

const diagram = "containerTests.diagram";

const ids = {
	node1: "node-1",
	node2: "node-2",
	node3: "node-3",
	node4: "node-4",
	edge1: "edge-1",
	container1: "container-1",
	container2: "container-2"
};

describe("Containers", () => {
	before(() => cy.visit(""));
	beforeEach(() => cy.loadDiagram(diagram));

	describe("Container Operations", () => {
		it("should be possible to add multiple nodes to container", () => {
			// given
			getDiagramNodeById(ids.node1).click();
			multiSelectNode(ids.node2);
			assertUiState(ui => {
				expect(ui.selectedElements).to.deep.equal({ [ids.node1]: true, [ids.node2]: true });
			});
			assertContainerProperties(ids.container1, container => {
				expect(container.children).length(0);
			});

			// when
			moveNode(ids.node2, 0, -220);

			// then
			assertContainerProperties(ids.container1, container => {
				expect(container.children).length(3);
				expect(container.children).to.include.members([ids.node1, ids.node2, ids.edge1]);
			});
		});

		it("should be possible to remove multiple nodes from container", () => {
			// given
			getDiagramNodeById(ids.node3).click();
			multiSelectNode(ids.node4);
			assertUiState(ui => {
				expect(ui.selectedElements).to.deep.equal({ [ids.node3]: true, [ids.node4]: true });
			});
			assertContainerProperties(ids.container2, container => {
				expect(container.children).length(2);
			});

			// when
			moveNode(ids.node4, 0, 170);

			// then
			assertContainerProperties(ids.container2, container => {
				expect(container.children).length(0);
			});
		});

		it("should be possible to move multiple nodes from one container to the other container", () => {
			// given
			getDiagramNodeById(ids.node3).click();
			multiSelectNode(ids.node4);
			assertUiState(ui => {
				expect(ui.selectedElements).to.deep.equal({ [ids.node3]: true, [ids.node4]: true });
			});
			assertContainerProperties(ids.container1, container => {
				expect(container.children).length(0);
			});
			assertContainerProperties(ids.container2, container => {
				expect(container.children).length(2);
			});

			// when
			moveNode(ids.node4, -670, -65);

			// then
			assertContainerProperties(ids.container1, container => {
				expect(container.children).length(2);
				expect(container.children).to.include.members([ids.node3, ids.node4]);
			});
			assertContainerProperties(ids.container2, container => {
				expect(container.children).length(0);
			});
		});
	});
});
