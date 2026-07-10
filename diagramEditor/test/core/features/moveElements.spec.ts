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

import { moveElements } from "../../../src/core/features/moveElements";
import { createConnectedEdge, createDiagramState, createNode } from "../../utils/diagramStateHelper";

describe("moveElements", () => {
	const vector = { x: 50, y: 30 };

	describe("moving nodes", () => {
		it("should move a selected node", () => {
			const readOnlyElements = {};
			const result = moveElements(["node1"], readOnlyElements, vector, diagram);

			expect(result.nodes.node1.x).toBe(150);
			expect(result.nodes.node1.y).toBe(130);
		});

		it("should not move a not selected node", () => {
			const readOnlyElements = {};
			const result = moveElements(["node2"], readOnlyElements, vector, diagram);

			expect(result.nodes.node1.x).toBe(100);
			expect(result.nodes.node1.y).toBe(100);
		});

		it("should not move a read-only node", () => {
			const readOnlyElements = { node1: true };
			const result = moveElements(["node1"], readOnlyElements, vector, diagram);

			expect(result.nodes.node1.x).toBe(100);
			expect(result.nodes.node1.y).toBe(100);
		});
	});

	describe("moving edges", () => {
		it("should move a selected edge when both nodes are selected", () => {
			const readOnlyElements = {};
			const result = moveElements(["node1", "node2", "edge1"], readOnlyElements, vector, diagram);

			expect(result.edges.edge1.anchors[0].x).toBe(175);
			expect(result.edges.edge1.anchors[0].y).toBe(155);
			expect(result.edges.edge1.anchors[2].x).toBe(275);
			expect(result.edges.edge1.anchors[2].y).toBe(255);
		});

		it("should not move an edge when source node is not selected", () => {
			const readOnlyElements = {};
			const result = moveElements(["node2", "edge1"], readOnlyElements, vector, diagram);

			expect(result.edges.edge1.anchors[0].x).toBe(125);
			expect(result.edges.edge1.anchors[0].y).toBe(125);
		});

		it("should not move an edge when target node is not selected", () => {
			const readOnlyElements = {};
			const result = moveElements(["node1", "edge1"], readOnlyElements, vector, diagram);

			expect(result.edges.edge1.anchors[2].x).toBe(225);
			expect(result.edges.edge1.anchors[2].y).toBe(225);
		});
	});

	describe("moving multiple elements", () => {
		it("should move all selected moveable elements", () => {
			const readOnlyElements = {};
			const result = moveElements(["node1", "node2", "edge1"], readOnlyElements, vector, diagram);

			expect(result.nodes.node1.x).toBe(150);
			expect(result.nodes.node1.y).toBe(130);
			expect(result.nodes.node2.x).toBe(250);
			expect(result.nodes.node2.y).toBe(230);

			expect(result.edges.edge1.anchors[0].x).toBe(175);
			expect(result.edges.edge1.anchors[0].y).toBe(155);
			expect(result.edges.edge1.anchors[2].x).toBe(275);
			expect(result.edges.edge1.anchors[2].y).toBe(255);
		});

		it("should move only moveable elements when some are read-only", () => {
			const readOnlyElements = { node2: true };
			const result = moveElements(["node1", "node2", "edge1"], readOnlyElements, vector, diagram);

			expect(result.nodes.node1.x).toBe(150);
			expect(result.nodes.node1.y).toBe(130);

			expect(result.nodes.node2.x).toBe(200);
			expect(result.nodes.node2.y).toBe(200);

			expect(result.edges.edge1.anchors[0].x).toBe(175);
			expect(result.edges.edge1.anchors[0].y).toBe(155);
		});
	});

	describe("edge cases", () => {
		it("should not modify diagram for non existing elements", () => {
			const readOnlyElements = {};

			const result = moveElements(["nonexistent"], readOnlyElements, vector, diagram);
			expect(result).toEqual(diagram);
		});

		it("should handle empty selection", () => {
			const readOnlyElements = {};
			const result = moveElements([], readOnlyElements, vector, diagram);

			expect(result).toEqual(diagram);
		});

		it("should handle all read-only elements", () => {
			const readOnlyElements = { node1: true, node2: true, edge1: true };
			const result = moveElements(["node1", "node2", "edge1"], readOnlyElements, vector, diagram);

			expect(result).toEqual(diagram);
		});
	});
});

const node1 = createNode({ id: "node1", x: 100, y: 100 });
const node2 = createNode({ id: "node2", x: 200, y: 200 });

const edge1 = createConnectedEdge({
	id: "edge1",
	anchors: [
		{ id: "a1", x: 125, y: 125 },
		{ id: "a2", x: 125, y: 225 },
		{ id: "a3", x: 225, y: 225 }
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
