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



import { ActivityMap } from "@com.mgmtp.a12.client/client-core/lib/core/activity";
import { DiagramState, UIState } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/state";

import { selectDiagramState } from "../../../../src/examples/store";

export function customTypeSelector(customType: string) {
	return `[data-customtype='${customType}']`;
}

export function idSelector(id: string) {
	return `#${id}`;
}

const canvasSelector = "[data-type='canvas']";

export function getCanvas() {
	return cy.get(canvasSelector);
}

const selectionRectangleSelector = "[data-type='selection-rectangle']";

export function getSelectionRectangle() {
	return cy.get(selectionRectangleSelector);
}

export function multiSelectElement(id: string) {
	const isMac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
	cy.get(idSelector(id)).click({ ctrlKey: !isMac, metaKey: isMac, force: true });
}

export function confirmRemoveDialog() {
	cy.get("[data-role='modal-overlay']").contains("button", "Remove").click();
}

export function panCanvas(x: number, y: number) {
	getCanvas()
		.trigger("mousedown", { button: 2 })
		.trigger("mousemove", { clientX: 0, clientY: 0 })
		.trigger("mousemove", { clientX: x, clientY: y })
		.trigger("mouseup", { button: 2 });
}

export function assertUiState(assertion: (uiState: UIState) => void) {
	cy.window().then(window => {
		const state = selectState(window);
		assertion(state.ui);
	});
}

export function setDiagramReadonly(readonly: boolean) {
	const readonlySwitchSelector = "#readonly-switch";
	if (readonly) {
		cy.get(readonlySwitchSelector).check();
	} else {
		cy.get(readonlySwitchSelector).uncheck();
	}
}

export function assertDiagramState(assertion: (diagramState: DiagramState) => void) {
	cy.window().then(window => {
		const diagramState = selectState(window);
		assertion(diagramState);
	});
}

function selectState(window: Window) {
	const state = window.store.getState() as { activities: ActivityMap };
	const activityId = Object.values(state.activities).find(a => a?.descriptor.diagram !== undefined)!.id;
	return selectDiagramState(activityId)(state);
}
