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

import { moveEdgeAnchor, canMoveEdgeAnchor } from "../../../src/core/features/moveEdgeAnchor";
import { createConnectedEdge, createDiagramState } from "../../utils/diagramStateHelper";

describe("moveEdgeAnchor", () => {
	const vector = { x: 50, y: 30 };

	describe("anchor movement", () => {
		it("should move a middle anchor", () => {
			const result = moveEdgeAnchor("edge1", "a2", vector, diagram);

			expect(result.edges.edge1.anchors).toHaveLength(5);
			const anchorsWithoutId = result.edges.edge1.anchors.map(({ id, ...rest }) => rest);
			expect(anchorsWithoutId[0]).toEqual({ x: 100, y: 100 });
			expect(anchorsWithoutId[1]).toEqual({ x: 150, y: 100 });
			expect(anchorsWithoutId[2]).toEqual({ x: 150, y: 230 });
			expect(anchorsWithoutId[3]).toEqual({ x: 200, y: 230 });
			expect(anchorsWithoutId[4]).toEqual({ x: 200, y: 200 });
		});
	});

	describe("error handling", () => {
		it("should throw if edge does not exist", () => {
			expect(() => moveEdgeAnchor("nonexistent", "a1", vector, diagram)).toThrow();
		});

		it("should throw if anchor does not exist", () => {
			expect(() => moveEdgeAnchor("edge1", "nonexistent", vector, diagram)).toThrow();
		});
	});
});

describe("canMoveEdgeAnchor", () => {
	it("should return true when edge is not readonly", () => {
		const readOnlyElements = {};
		const result = canMoveEdgeAnchor("edge1", readOnlyElements);
		expect(result).toBe(true);
	});

	it("should return false when edge is readonly", () => {
		const readOnlyElements = { edge1: true };
		const result = canMoveEdgeAnchor("edge1", readOnlyElements);
		expect(result).toBe(false);
	});

	it("should return true for different edge when target is not readonly", () => {
		const readOnlyElements = { edge2: true };
		const result = canMoveEdgeAnchor("edge1", readOnlyElements);
		expect(result).toBe(true);
	});
});

const edge = createConnectedEdge({
	id: "edge1",
	anchors: [
		{ id: "a1", x: 100, y: 100 },
		{ id: "a2", x: 100, y: 200 },
		{ id: "a3", x: 200, y: 200 }
	]
});

const diagram = createDiagramState({
	diagram: { edges: { edge1: edge } }
}).diagram;
