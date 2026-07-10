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

import { toggleSelectedElement, selectElementsInArea } from "../../../src/core/features/multiSelection";
import { createConnectedEdge, createDiagramState, createNode } from "../../utils/diagramStateHelper";
import type { Area } from "../../../src/core/geometry";

describe("multiSelection", () => {
	describe("toggleSelectedElement", () => {
		describe("adding elements to selection", () => {
			it("should add element to empty selection", () => {
				const selectedElements: Record<string, true> = {};
				const result = toggleSelectedElement(selectedElements, "element1");

				expect(result).toEqual({ element1: true });
			});

			it("should add element to existing selection", () => {
				const selectedElements: Record<string, true> = { element1: true, element2: true };
				const result = toggleSelectedElement(selectedElements, "element3");

				expect(result).toEqual({ element1: true, element2: true, element3: true });
			});

			it("should not modify original selection object", () => {
				const selectedElements: Record<string, true> = { element1: true };
				const result = toggleSelectedElement(selectedElements, "element2");

				expect(selectedElements).toEqual({ element1: true });
				expect(result).not.toBe(selectedElements);
			});
		});

		describe("removing elements from selection", () => {
			it("should remove element from selection", () => {
				const selectedElements: Record<string, true> = { element1: true, element2: true };
				const result = toggleSelectedElement(selectedElements, "element1");

				expect(result).toEqual({ element2: true });
			});

			it("should remove last element from selection", () => {
				const selectedElements: Record<string, true> = { element1: true };
				const result = toggleSelectedElement(selectedElements, "element1");

				expect(result).toEqual({});
			});
		});
	});

	describe("selectElementsInArea", () => {
		describe("selecting nodes", () => {
			it("should select nodes completely contained in area", () => {
				const area: Area = {
					topLeft: { x: 50, y: 50 },
					rectangle: { width: 250, height: 250 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).to.include.all.keys(["node1", "node2"]);
			});

			it("should not select nodes partially overlapping area", () => {
				const area: Area = {
					topLeft: { x: 150, y: 150 },
					rectangle: { width: 100, height: 100 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({});
			});

			it("should select single node exactly fitting area", () => {
				const area: Area = {
					topLeft: { x: 100, y: 100 },
					rectangle: { width: 100, height: 80 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({ node1: true });
			});

			it("should handle area with zero dimensions", () => {
				const area: Area = {
					topLeft: { x: 100, y: 100 },
					rectangle: { width: 0, height: 0 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({});
			});
		});

		describe("selecting edges", () => {
			it("should select edges completely contained in area", () => {
				const area: Area = {
					topLeft: { x: 50, y: 50 },
					rectangle: { width: 300, height: 300 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).to.include.keys(["edge1"]);
			});

			it("should not select edges partially outside area", () => {
				const area: Area = {
					topLeft: { x: 120, y: 120 },
					rectangle: { width: 50, height: 50 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({});
			});
		});

		describe("selecting mixed elements", () => {
			it("should select all elements in large area", () => {
				const area: Area = {
					topLeft: { x: 0, y: 0 },
					rectangle: { width: 500, height: 500 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({ node1: true, node2: true, edge1: true });
			});

			it("should select no elements outside diagram bounds", () => {
				const area: Area = {
					topLeft: { x: 1000, y: 1000 },
					rectangle: { width: 100, height: 100 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({});
			});
		});

		describe("edge cases", () => {
			it("should handle empty diagram", () => {
				const emptyDiagram = createDiagramState({
					diagram: { nodes: {}, edges: {} }
				}).diagram;

				const area: Area = {
					topLeft: { x: 0, y: 0 },
					rectangle: { width: 500, height: 500 }
				};

				const result = selectElementsInArea(emptyDiagram, area);

				expect(result).toEqual({});
			});

			it("should handle negative area coordinates", () => {
				const area: Area = {
					topLeft: { x: -100, y: -100 },
					rectangle: { width: 100, height: 100 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({});
			});

			it("should handle very large area", () => {
				const area: Area = {
					topLeft: { x: -100000, y: -100000 },
					rectangle: { width: 200000, height: 200000 }
				};

				const result = selectElementsInArea(diagram, area);

				expect(result).toEqual({ node1: true, node2: true, edge1: true });
			});
		});
	});
});

const node1 = createNode({
	id: "node1",
	x: 100,
	y: 100,
	width: 100,
	height: 80
});

const node2 = createNode({
	id: "node2",
	x: 200,
	y: 200,
	width: 100,
	height: 80
});

const edge1 = createConnectedEdge({
	id: "edge1",
	anchors: [
		{ id: "a1", x: 125, y: 125 },
		{ id: "a2", x: 225, y: 225 }
	],
	sourceNodeId: node1.id,
	sourcePortId: "port1",
	targetNodeId: node2.id,
	targetPortId: "port2"
});

const diagram = createDiagramState({
	diagram: {
		nodes: { node1, node2 },
		edges: { edge1 }
	}
}).diagram;
