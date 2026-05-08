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

import { it, expect, describe } from "vitest";

import { testRecipe } from "@com.mgmtp.a12.devtools/codemod";

import { preferTopLevelImportsRecipe } from "../recipes/prefer-top-level-imports.js";

describe("preferTopLevelImports", () => {
	it("should migrate properly", async () => {
		await expect(
			testRecipe(
				preferTopLevelImportsRecipe,
				`import * as React from "react";
import { useSelector } from "react-redux";

import { Diagram } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/diagram";
import { DiagramNode, createDiagramNode } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/node";
import { DiagramState, isNode } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/state";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramActions";
import { diagramBlacklistedActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/reduxDevTools/blacklistedActions";
import { DefaultNodeWidget } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/node/nodeWidget";
import { getCanvasDimensions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/utils/htmlHelper";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core/lib/core/activity/index.js";

import { useShowcaseContext } from "../context.js";

`
			)
		).resolves.toMatchInlineSnapshot(`
			"import * as React from "react";
			import { useSelector } from "react-redux";

			import { Diagram, DiagramNode, createDiagramNode, DiagramState, isNode, a12DiagramActions, diagramBlacklistedActions, DefaultNodeWidget, getCanvasDimensions } from "@com.mgmtp.a12.diagrameditor/diagrameditor";
			import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core/lib/core/activity/index.js";

			import { useShowcaseContext } from "../context.js";

			"
		`);
	});
});
