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

import { moveEdgeEnd } from "../../../src/core/features/moveEdgeEnd";
import { createConnectedEdge, createDiagramState } from "../../utils/diagramStateHelper";

describe("moveEdgeEnd", () => {
	const vector = { x: 50, y: 30 };
	it("should move first anchor", () => {
		const result = moveEdgeEnd("edge1", "a1", vector, diagram);

		expect(result.edges.edge1.anchors).toHaveLength(3);
		expect(result.edges.edge1.anchors[0]).toEqual({ id: "a1", x: 150, y: 130 });
		expect(result.edges.edge1.anchors[1]).toEqual({ id: "a2", x: 150, y: 200 });
		expect(result.edges.edge1.anchors[2]).toEqual({ id: "a3", x: 200, y: 200 });
	});

	it("should move last anchor", () => {
		const result = moveEdgeEnd("edge1", "a3", vector, diagram);

		expect(result.edges.edge1.anchors).toHaveLength(3);
		expect(result.edges.edge1.anchors[0]).toEqual({ id: "a1", x: 100, y: 100 });
		expect(result.edges.edge1.anchors[1]).toEqual({ id: "a2", x: 100, y: 230 });
		expect(result.edges.edge1.anchors[2]).toEqual({ id: "a3", x: 250, y: 230 });
	});

	it("should throw if anchor does not exist", () => {
		expect(() => moveEdgeEnd("edge1", "undefined", vector, diagram)).toThrow();
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
