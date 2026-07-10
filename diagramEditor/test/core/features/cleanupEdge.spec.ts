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

import { removeDuplicatedAnchors, removeCollinearSegments } from "../../../src/core/features/cleanUpEdge";
import { createConnectedEdge } from "../../utils/diagramStateHelper";

describe("removeDuplicatedAnchors", () => {
	it("should remove duplicated anchors", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "a1", x: 100, y: 100 },
				{ id: "a11", x: 100, y: 100 },
				{ id: "a111", x: 100, y: 100 },
				{ id: "a3", x: 150, y: 150 },
				{ id: "a4", x: 200, y: 200 },
				{ id: "a44", x: 200, y: 200 }
			]
		});

		const result = removeDuplicatedAnchors(edge);
		expect(result.anchors).toEqual([
			{ id: "a1", x: 100, y: 100 },
			{ id: "a3", x: 150, y: 150 },
			{ id: "a4", x: 200, y: 200 }
		]);
	});

	it("should preserve the protected anchor", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "a1", x: 100, y: 100 },
				{ id: "a11", x: 100, y: 100 },
				{ id: "a111", x: 100, y: 100 },
				{ id: "a3", x: 150, y: 150 },
				{ id: "a4", x: 200, y: 200 },
				{ id: "a44", x: 200, y: 200 }
			]
		});

		const result = removeDuplicatedAnchors(edge, "a111");
		expect(result.anchors).toEqual([
			{ id: "a111", x: 100, y: 100 },
			{ id: "a3", x: 150, y: 150 },
			{ id: "a4", x: 200, y: 200 }
		]);
	});
});

describe("removeCollinearAnchors", () => {
	it("should remove collinear anchors", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "a1", x: 100, y: 100 },
				{ id: "a2", x: 200, y: 100 },
				{ id: "a3", x: 200, y: 200 },
				{ id: "a33", x: 200, y: 300 },
				{ id: "a333", x: 200, y: 400 },
				{ id: "a4", x: 300, y: 400 },
				{ id: "a44", x: 400, y: 400 },
				{ id: "a444", x: 500, y: 400 },
				{ id: "a5", x: 500, y: 600 }
			]
		});

		const result = removeCollinearSegments(edge);
		expect(result.anchors).toEqual([
			{ id: "a1", x: 100, y: 100 },
			{ id: "a2", x: 200, y: 100 },
			{ id: "a333", x: 200, y: 400 },
			{ id: "a444", x: 500, y: 400 },
			{ id: "a5", x: 500, y: 600 }
		]);
	});

	it("should preserve the protected anchor", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "a1", x: 100, y: 100 },
				{ id: "a2", x: 200, y: 100 },
				{ id: "a3", x: 200, y: 200 },
				{ id: "a33", x: 200, y: 300 },
				{ id: "a333", x: 200, y: 400 },
				{ id: "a4", x: 300, y: 400 },
				{ id: "a44", x: 400, y: 400 },
				{ id: "a444", x: 500, y: 400 },
				{ id: "a5", x: 500, y: 600 }
			]
		});

		const result = removeCollinearSegments(edge, "a3");
		expect(result.anchors).toEqual([
			{ id: "a1", x: 100, y: 100 },
			{ id: "a3", x: 200, y: 100 },
			{ id: "a333", x: 200, y: 400 },
			{ id: "a444", x: 500, y: 400 },
			{ id: "a5", x: 500, y: 600 }
		]);
	});
});
