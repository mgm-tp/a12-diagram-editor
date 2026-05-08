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



import { DiagramNode } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/node";

import { idSelector, customTypeSelector, assertDiagramState } from "./utils";

const nodeSelector = "[data-type='node']";
const portSelector = "[data-type='port']";

export function getDiagramNodeById(id: string) {
	return cy.root().find(`${idSelector(id)}${nodeSelector}`);
}

export function getDiagramNodeByLabel(label: string) {
	return cy.root().contains(nodeSelector, label);
}

export function getCustomDiagramNodeByLabel(label: string, customType: string) {
	return cy.root().contains(customTypeSelector(customType), label);
}

export function getPortById(portId: string) {
	return cy.root().find(`${idSelector(portId)}${portSelector}`);
}

export function multiSelectNode(nodeId: string) {
	getDiagramNodeById(nodeId).click({ ctrlKey: true });
}

export function moveNode(nodeId: string, x: number, y: number) {
	getDiagramNodeById(nodeId)
		.trigger("mousedown", { button: 0 })
		.trigger("mousemove", { clientX: 0, clientY: 0 })
		.trigger("mousemove", { clientX: x, clientY: y })
		.trigger("mouseup");
}

export function assertNodeProperties(nodeId: string, assertion: (node: DiagramNode) => void) {
	assertDiagramState(diagramState => {
		assertion(diagramState.diagram.nodes[nodeId]);
	});
}
