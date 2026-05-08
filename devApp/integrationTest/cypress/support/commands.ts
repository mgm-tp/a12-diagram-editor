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



import { Store, StoreEnhancer } from "redux";

import { Diagram } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/diagram";
import { ActivityMap } from "@com.mgmtp.a12.client/client-core/lib/core/activity";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramActions";

declare global {
	namespace Cypress {
		interface Chainable {
			loadDiagram(relativePath: string): Chainable<string>;
		}
	}
	interface Window {
		store: Store;
		URL: {
			createObjectURL(object: File | Blob | MediaSource): string;
		};
		__REACT_DEVTOOLS_GLOBAL_HOOK__(): StoreEnhancer;
	}
}

Cypress.Commands.add("loadDiagram", (relativePath: string) => {
	return cy.readFile(`${"cypress/fixtures/diagrams"}/${relativePath}`).then(content => {
		const diagram = JSON.parse(content) as Diagram;
		cy.window().then(window => {
			const state = window.store.getState() as { activities: ActivityMap };
			const activityId = Object.values(state.activities).find(a => a?.descriptor.diagram !== undefined)!.id;

			return window.store.dispatch(a12DiagramActions.diagramLoaded({ activityId, diagram }));
		});
	});
});
