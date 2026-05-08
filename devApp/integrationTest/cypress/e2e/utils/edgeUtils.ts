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



import { DiagramEdge, isConnectedEdge } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/edge";

import { idSelector, customTypeSelector, assertDiagramState } from "./utils";
import { getDiagramNodeById, getPortById } from "./nodeUtils";

const edgeSelector = "[data-type='edge']";

export function getDiagramEdges() {
	return cy.root().find(edgeSelector);
}

export function getDiagramEdgeByLabel(label: string) {
	return cy.root().contains(edgeSelector, label);
}

export function getDiagramEdgeById(id: string) {
	return cy.root().find(`${idSelector(id)}${edgeSelector}`);
}

export function getCustomDiagramEdgeByLabel(customType: string) {
	return cy.root().find(customTypeSelector(customType));
}

export function createOrReconnectEdge(nodeId1: string, portId1: string, nodeId2: string, portId2: string) {
	getDiagramNodeById(nodeId1).trigger("mouseover");
	getPortById(portId1).trigger("mousedown", { button: 0 }).trigger("mousemove", { clientX: 0, clientY: 0 });
	getDiagramNodeById(nodeId2).trigger("mouseover");
	getPortById(portId2).trigger("mouseup", { button: 0 });
}

export function assertNodesAreConnected(node1: string, node2: string) {
	assertNodeConnection(node1, node2, true);
}

export function assertNodesAreNotConnected(node1: string, node2: string) {
	assertNodeConnection(node1, node2, false);
}

function assertNodeConnection(node1: string, node2: string, shouldBeConnected: boolean) {
	const nodes = [node1, node2].sort((a, b) => a.localeCompare(b));
	assertDiagramState(state => {
		const edge = Object.values(state.diagram.edges)
			.filter(isConnectedEdge)
			.find(e => {
				const connectedNodes = [e.sourceNodeId, e.targetNodeId].sort((a, b) => a.localeCompare(b));
				return connectedNodes[0] === nodes[0] && connectedNodes[1] === nodes[1];
			});

		if (shouldBeConnected) {
			expect(edge, `Could not find edge that connects ${node1} and ${node2}`).to.exist;
		} else {
			expect(edge, `Found edge that connects ${node1} and ${node2}, but expected not to`).to.not.exist;
		}
	});
}

export function assertEdgeProperties(edgeId: string, assertion: (edge: DiagramEdge) => void) {
	assertDiagramState(diagramState => {
		assertion(diagramState.diagram.edges[edgeId]);
	});
}
