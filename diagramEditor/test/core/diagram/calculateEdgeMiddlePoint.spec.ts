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



import { calculateEdgeMiddlePoint } from "../../../src/core/diagram/edge";
import { createConnectedEdge } from "../../utils/diagramStateHelper";

describe("calculateEdgeMiddlePoint", () => {
	it("should return the middle point of a horizontal edge", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "anchor1", x: 0, y: 0 },
				{ id: "anchor2", x: 10, y: 0 }
			]
		});

		const middlePoint = calculateEdgeMiddlePoint(edge);
		expect(middlePoint).toEqual({ segmentIndex: 0, x: 5, y: 0 });
	});

	it("should return the middle point of a vertical edge", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "anchor1", x: 0, y: 0 },
				{ id: "anchor2", x: 0, y: 10 }
			]
		});

		const middlePoint = calculateEdgeMiddlePoint(edge);
		expect(middlePoint).toEqual({ segmentIndex: 0, x: 0, y: 5 });
	});

	it("should return the middle point of a diagonal edge", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "anchor1", x: 0, y: 0 },
				{ id: "anchor2", x: 40, y: 20 }
			]
		});

		const middlePoint = calculateEdgeMiddlePoint(edge);
		expect(middlePoint).toEqual({ segmentIndex: 0, x: 20, y: 10 });
	});

	it("should return the middle point of an edge with multiple anchors", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "anchor1", x: 0, y: 0 },
				{ id: "anchor2", x: 10, y: 0 },
				{ id: "anchor3", x: 10, y: 10 },
				{ id: "anchor4", x: 20, y: 10 }
			]
		});

		const middlePoint = calculateEdgeMiddlePoint(edge);
		expect(middlePoint).toEqual({ segmentIndex: 1, x: 10, y: 5 });
	});

	it("should return the anchor position if the two only anchors are the same", () => {
		const edge = createConnectedEdge({
			anchors: [
				{ id: "anchor1", x: 10, y: 10 },
				{ id: "anchor2", x: 10, y: 10 }
			]
		});

		const middlePoint = calculateEdgeMiddlePoint(edge);
		expect(middlePoint).toEqual({ segmentIndex: 0, x: 10, y: 10 });
	});
});
