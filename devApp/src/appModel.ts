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

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

export const appModel: ApplicationModel = {
	header: { id: "", modelType: "application", modelVersion: "1.0.0" },
	content: {
		defaultRegion: ["CONTENT"],
		region: {
			name: "APP",
			layout: { name: "ApplicationFrame" },
			subRegions: [
				{ name: "CONTENT", layout: { name: "Stack" } },
				{ name: "SIDEBAR", layout: { name: "Null" } }
			]
		},
		modules: [
			{
				name: "module",
				flows: [
					{
						name: "flow",
						scenes: [
							{
								name: "sidebarScene",
								matchConditions: [{ key: "view", mustEqual: "sidebar" }],
								sceneChange: { onEnter: [{ name: "SidebarView", type: "VIEW_ADD", region: ["SIDEBAR"] }] }
							},
							{
								name: "basicDiagramScene",
								matchConditions: [{ key: "diagram", mustEqual: "basic" }],
								sceneChange: { onEnter: [{ name: "BasicDiagramView", type: "VIEW_ADD", loadData: true }] }
							},
							{
								name: "emptyDiagramScene",
								matchConditions: [{ key: "diagram", mustEqual: "empty" }],
								sceneChange: { onEnter: [{ name: "EmptyDiagramView", type: "VIEW_ADD", loadData: true }] }
							},
							{
								name: "performanceDiagramScene",
								matchConditions: [{ key: "diagram", mustEqual: "performance" }],
								sceneChange: { onEnter: [{ name: "PerformanceDiagramView", type: "VIEW_ADD", loadData: true }] }
							}
						]
					}
				]
			}
		]
	}
};
