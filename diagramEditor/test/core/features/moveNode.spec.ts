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

import type { ConnectedDiagramEdge, DiagramEdge } from "../../../src/core/diagram/edge";
import { moveNode } from "../../../src/core/features/moveNode";
import { createConnectedEdge, createDiagramState, createNode } from "../../utils/diagramStateHelper";

describe("moveNode", () => {
	describe("node movement", () => {
		it("should move a node by the given vector", () => {
			const vector = { x: 50, y: 30 };
			const result = moveNode("node1", vector, diagram);

			expect(result.nodes.node1).toEqual({ ...node1, x: 150, y: 130 });
		});

		it("should not affect other nodes", () => {
			const vector = { x: 50, y: 30 };
			const result = moveNode("node1", vector, diagram);

			expect(result.nodes.node2).toEqual(node2);
		});
	});

	describe("edge updates", () => {
		it("should update both incoming and outgoing edge anchors", () => {
			const vector = { x: 50, y: 30 };
			const result = moveNode("node1", vector, diagram);

			expect(result.edges.edge1.anchors[0]).toEqual({ id: "a1", x: 175, y: 155 });
			expect(result.edges.edge2.anchors[2]).toEqual({ id: "a6", x: 175, y: 155 });
		});

		it("should maintain edge connectivity after move", () => {
			const vector = { x: 50, y: 30 };
			const result = moveNode("node1", vector, diagram);

			const edge1 = result.edges.edge1 as ConnectedDiagramEdge;
			const edge2 = result.edges.edge2 as ConnectedDiagramEdge;

			expect(edge1.sourceNodeId).toBe("node1");
			expect(edge1.targetNodeId).toBe("node2");
			expect(edge2.sourceNodeId).toBe("node2");
			expect(edge2.targetNodeId).toBe("node1");
		});
	});

	describe("edge cases", () => {
		it("should handle node without connected edges", () => {
			const diagramWithoutEdges = createDiagramState({ diagram: { nodes: { node1, node2 }, edges: {} } }).diagram;

			const vector = { x: 50, y: 30 };
			const result = moveNode("node1", vector, diagramWithoutEdges);

			expect(result.nodes.node1.x).toBe(150);
			expect(result.nodes.node1.y).toBe(130);
			expect(Object.keys(result.edges)).toHaveLength(0);
		});

		it("should handle node with empty anchor arrays", () => {
			const edgeWithoutAnchors: DiagramEdge = {
				...edge1,
				anchors: []
			};
			const diagramWithEmptyAnchors = createDiagramState({
				diagram: {
					nodes: { node1, node2 },
					edges: { edge1: edgeWithoutAnchors }
				}
			}).diagram;

			const vector = { x: 50, y: 30 };
			const result = moveNode("node1", vector, diagramWithEmptyAnchors);

			expect(result.edges.edge1.anchors).toHaveLength(0);
		});
	});
});

const node1 = createNode({ id: "node1", x: 100, y: 100 });
const node2 = createNode({ id: "node2", x: 200, y: 200 });

const edge1 = createConnectedEdge({
	id: "edge1",
	sourceNodeId: "node1",
	targetNodeId: "node2",
	anchors: [
		{ id: "a1", x: 125, y: 125 }, // Connected to node1
		{ id: "a2", x: 125, y: 225 },
		{ id: "a3", x: 225, y: 225 } // Connected to node2
	]
});
const edge2 = createConnectedEdge({
	id: "edge2",
	sourceNodeId: "node2",
	targetNodeId: "node1",
	anchors: [
		{ id: "a4", x: 225, y: 225 }, // Connected to node2
		{ id: "a5", x: 225, y: 125 },
		{ id: "a6", x: 125, y: 125 } // Connected to node1
	]
});

const diagram = createDiagramState({ diagram: { nodes: { node1, node2 }, edges: { edge1, edge2 } } }).diagram;
