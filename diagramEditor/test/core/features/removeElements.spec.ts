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



import { removeElements } from "../../../src/core/features/removeElements";
import { createConnectedEdge, createDiagramState, createNode } from "../../utils/diagramStateHelper";

describe("removeSelectedElements", () => {
	describe("removing single elements", () => {
		it("should remove only the selected edge", () => {
			const state = createDiagramState({
				...baseState,
				ui: { selectedElements: { edge1: true } }
			});

			const result = removeElements(state, [edge1.id]);

			expect(result.diagram.edges).toEqual({ edge2 });
			expect(result.diagram.nodes).toEqual({ node1, node2, node3 });
			expect(result.ui.selectedElements).toEqual({});
		});

		it("should remove only the isolated node", () => {
			const isolatedNode = createNode({ id: "isolated", x: 800, y: 0, label: "Isolated" });
			const stateWithIsolated = createDiagramState({
				diagram: {
					nodes: { node1, node2, node3, isolated: isolatedNode },
					edges: { edge1, edge2 }
				},
				ui: { selectedElements: { isolated: true } }
			});

			const result = removeElements(stateWithIsolated, [isolatedNode.id]);

			expect(result.diagram.nodes).toEqual({ node1, node2, node3 });
			expect(result.diagram.edges).toEqual({ edge1, edge2 });
		});

		it("should remove node and clean up connected edges", () => {
			const state = createDiagramState({
				...baseState,
				ui: { selectedElements: { node2: true } }
			});

			const result = removeElements(state, [node2.id]);

			expect(result.diagram.nodes).toEqual({ node1, node3 });
			expect(result.diagram.edges).toEqual({});
			expect(result.ui.selectedElements).toEqual({});
		});
	});

	describe("readonly element protection", () => {
		it("should not remove readonly node", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { node1: true },
					readonlyElements: { node1: true }
				}
			});

			const result = removeElements(state, [node1.id]);

			expect(result.diagram.nodes).toEqual({ node1, node2, node3 });
			expect(result.diagram.edges).toEqual({ edge1, edge2 });
			expect(result.ui.selectedElements).toEqual({ node1: true });
			expect(result.ui.readonlyElements).toEqual({ node1: true });
		});

		it("should not remove readonly edge", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { edge1: true },
					readonlyElements: { edge1: true }
				}
			});

			const result = removeElements(state, [edge1.id]);

			expect(result.diagram.edges).toEqual({ edge1, edge2 });
			expect(result.diagram.nodes).toEqual({ node1, node2, node3 });
			expect(result.ui.selectedElements).toEqual({ edge1: true });
			expect(result.ui.readonlyElements).toEqual({ edge1: true });
		});

		it("should remove readonly connected edges when adjacent node is removed", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { node1: true },
					readonlyElements: { edge1: true }
				}
			});

			const result = removeElements(state, [node1.id]);

			expect(result.diagram.nodes).toEqual({ node2, node3 });
			expect(result.diagram.edges).toEqual({ edge2 });
			expect(result.ui.selectedElements).toEqual({});
			expect(result.ui.readonlyElements).toEqual({});
		});

		it("should not remove any readonly elements when mixed selection", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { node1: true, node2: true, edge1: true, edge2: true },
					readonlyElements: { node2: true, edge2: true }
				}
			});

			const result = removeElements(state, [node1.id, node2.id, edge1.id, edge2.id]);

			expect(result.diagram.nodes).toEqual({ node2, node3 });
			expect(result.diagram.edges).toEqual({ edge2 });
			expect(result.ui.selectedElements).toEqual({ node2: true, edge2: true });
			expect(result.ui.readonlyElements).toEqual({ node2: true, edge2: true });
		});
	});

	describe("removing multiple elements", () => {
		it("should remove multiple selected nodes and edges", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { node1: true, edge2: true }
				}
			});

			const result = removeElements(state, [node1.id, edge2.id]);

			expect(result.diagram.nodes).toEqual({ node2, node3 });
			expect(result.diagram.edges).toEqual({});
			expect(result.ui.selectedElements).toEqual({});
		});

		it("should remove all elements when all are selected", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { node1: true, node2: true, node3: true, edge1: true, edge2: true }
				}
			});

			const result = removeElements(state, [node1.id, node2.id, node3.id, edge1.id, edge2.id]);

			expect(result.diagram.nodes).toEqual({});
			expect(result.diagram.edges).toEqual({});
			expect(result.ui.selectedElements).toEqual({});
		});
	});

	describe("UI state management", () => {
		it("should clean up selectedElements and readonlyElements for removed elements", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { node1: true, node2: true },
					readonlyElements: { edge1: true }
				}
			});

			const result = removeElements(state, [node1.id]);

			expect(result.ui.selectedElements).toEqual({ node2: true });
			expect(result.ui.readonlyElements).toEqual({});
		});

		it("should preserve other UI state properties", () => {
			const state = createDiagramState({
				...baseState,
				ui: {
					selectedElements: { node1: true },
					zoomLevel: 150,
					offset: { left: 100, top: 50 },
					showGrid: false,
					gridStepSize: 10
				}
			});

			const result = removeElements(state, [node1.id]);

			expect(result.ui.zoomLevel).toBe(150);
			expect(result.ui.offset).toEqual({ left: 100, top: 50 });
			expect(result.ui.showGrid).toBe(false);
			expect(result.ui.gridStepSize).toBe(10);
		});
	});

	describe("edge cases", () => {
		it("should handle empty selection", () => {
			const result = removeElements(baseState, []);

			expect(result.diagram).toEqual(baseState.diagram);
			expect(result.ui).toEqual(baseState.ui);
		});

		it("should handle diagram with no elements", () => {
			const emptyState = createDiagramState({
				diagram: { nodes: {}, edges: {} }
			});

			const result = removeElements(emptyState, []);

			expect(result.diagram).toEqual(emptyState.diagram);
			expect(result.ui.selectedElements).toEqual({});
		});
	});
});

const node1 = createNode({ id: "node1", x: 0, y: 0, label: "Node 1" });
const node2 = createNode({ id: "node2", x: 200, y: 0, label: "Node 2" });
const node3 = createNode({ id: "node3", x: 400, y: 0, label: "Node 3" });

const edge1 = createConnectedEdge({
	id: "edge1",
	sourceNodeId: "node1",
	sourcePortId: "port1",
	targetNodeId: "node2",
	targetPortId: "port2",
	anchors: [
		{ id: "anchor1", x: 100, y: 40 },
		{ id: "anchor2", x: 200, y: 40 }
	]
});

const edge2 = createConnectedEdge({
	id: "edge2",
	sourceNodeId: "node2",
	sourcePortId: "port3",
	targetNodeId: "node3",
	targetPortId: "port4",
	anchors: [
		{ id: "anchor3", x: 300, y: 40 },
		{ id: "anchor4", x: 400, y: 40 }
	]
});

const baseState = createDiagramState({
	diagram: {
		nodes: { node1, node2, node3 },
		edges: { edge1, edge2 }
	}
});
