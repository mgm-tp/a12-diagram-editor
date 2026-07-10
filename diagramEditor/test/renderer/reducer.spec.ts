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

import { defaultDiagramReducer, diagramActions } from "../../src/renderer/store/slice";
import type { DiagramState } from "../../src/core/state";
import type { ConnectedDiagramEdge, UnconnectedDiagramEdge } from "../../src/core/diagram/edge";

import {
	createConnectedEdge,
	createDiagramState,
	createNode,
	createUnconnectedEdge
} from "../utils/diagramStateHelper";

describe("Reducer", () => {
	describe("Move Actions", () => {
		it("should handle node move", () => {
			const result = defaultDiagramReducer(
				{ ...initialState, ui: { ...initialState.ui, selectedElements: { node1: true } } },
				diagramActions.singleNodeMoved({ nodeId: "node1", vector: { x: 50, y: 50 } })
			);
			expect(result.diagram.nodes.node1.x).toEqual(50);
			expect(result.diagram.nodes.node1.y).toEqual(50);
		});

		it("should handle segment move", () => {
			const result = defaultDiagramReducer(
				{ ...initialState, ui: { ...initialState.ui, selectedElements: { edge1: true } } },
				diagramActions.singleSegmentMoved({ anchorId: "a1", parentEdgeId: "edge1", vector: { x: 10, y: 10 } })
			);

			const resultAnchor = result.diagram.edges.edge1.anchors.find(anchor => anchor.id === "a1")!;
			expect(resultAnchor.x).toEqual(10);
			expect(resultAnchor.y).toEqual(0); // edge segment is moved horizontally
		});

		it("should handle multiple elements moved", () => {
			const result = defaultDiagramReducer(
				{ ...initialState, ui: { ...initialState.ui, selectedElements: { node1: true, node2: true, edge1: true } } },
				diagramActions.elementsMoved({ draggedElementId: "node1", vector: { x: 20, y: 20 } })
			);
			expect(result.diagram.nodes.node1.x).toEqual(20);
			expect(result.diagram.nodes.node1.y).toEqual(20);
			expect(result.diagram.nodes.node2.x).toEqual(20);
			expect(result.diagram.nodes.node2.y).toEqual(20);

			for (const anchor of initialState.diagram.edges.edge1.anchors) {
				const resultAnchor = result.diagram.edges.edge1.anchors.find(a => a.id === anchor.id)!;
				expect(resultAnchor.x).toEqual(anchor.x + 20);
				expect(resultAnchor.y).toEqual(anchor.y + 20);
			}
		});
	});

	describe("Edge Actions", () => {
		it("should handle edge connected", () => {
			const state = createDiagramState({
				...initialState,
				diagram: { nodes: initialState.diagram.nodes, edges: { [unconnectedEdge.id]: unconnectedEdge } }
			});
			const result = defaultDiagramReducer(
				state,
				diagramActions.edgeConnected({ edgeId: unconnectedEdge.id, portId: "port2" })
			);

			const edge = result.diagram.edges.unconnectedEdge as ConnectedDiagramEdge;
			expect(edge.sourceNodeId).toBe("node1");
			expect(edge.targetNodeId).toBe("node2");
			expect(edge.sourcePortId).toBe("port1");
			expect(edge.targetPortId).toBe("port2");
		});

		it("should handle edge disconnected", () => {
			const result = defaultDiagramReducer(
				initialState,
				diagramActions.edgeDisconnected({ edgeId: "edge1", portId: "port1" })
			);

			expect(result.backup).toBeDefined();
			expect(result.ui.selectedElements).toEqual({ edge1: true });
			const edge = result.diagram.edges.edge1 as UnconnectedDiagramEdge;
			expect(edge.targetNodeId).toBe("node2");
			expect(edge.targetPortId).toBe("port2");
		});

		it("should handle edge end moved", () => {
			const state = createDiagramState({
				...initialState,
				diagram: { nodes: initialState.diagram.nodes, edges: { [unconnectedEdge.id]: unconnectedEdge } }
			});
			const result = defaultDiagramReducer(
				state,
				diagramActions.edgeEndMoved({ edgeId: unconnectedEdge.id, anchorId: "a2", vector: { x: 20, y: 30 } })
			);

			const movedAnchor = result.diagram.edges[unconnectedEdge.id].anchors.find(a => a.id === "a2");
			expect(movedAnchor).toBeDefined();
			expect(movedAnchor?.x).toEqual(120);
			expect(movedAnchor?.y).toEqual(130);
		});

		it("should handle new edge created", () => {
			const result = defaultDiagramReducer(initialState, diagramActions.newEdgeCreated({ edge: unconnectedEdge }));

			expect(result.backup).toBeDefined();
			expect(result.diagram.edges[unconnectedEdge.id]).toEqual(unconnectedEdge);
			expect(result.ui.selectedElements).toEqual({ [unconnectedEdge.id]: true });
		});

		it("should handle edge anchor moved", () => {
			const result = defaultDiagramReducer(
				initialState,
				diagramActions.edgeAnchorMoved({ parentEdgeId: "edge1", anchorId: "a2", vector: { x: 50, y: 30 } })
			);

			const resultEdge = result.diagram.edges.edge1;
			const movedAnchor = resultEdge.anchors.find(anchor => anchor.id === "a2")!;
			expect(movedAnchor.x).toEqual(50);
			expect(movedAnchor.y).toEqual(130);

			const previousAnchor = resultEdge.anchors.find(anchor => anchor.id === "a1")!;
			expect(previousAnchor.x).toEqual(50);
			expect(previousAnchor.y).toEqual(0);

			const nextAnchor = resultEdge.anchors.find(anchor => anchor.id === "a3")!;
			expect(nextAnchor.x).toEqual(100);
			expect(nextAnchor.y).toEqual(130);
		});
	});

	describe("UI Actions", () => {
		it("should handle canvas drag", () => {
			const result = defaultDiagramReducer(initialState, diagramActions.canvasDragged({ vector: { x: 100, y: 50 } }));
			expect(result.ui.offset).toEqual({ left: 100, top: 50 });
		});

		it("should handle canvas zoom", () => {
			const result = defaultDiagramReducer(
				initialState,
				diagramActions.canvasZoomed({
					scrollDelta: 100,
					diagramPosition: { x: 0, y: 0 }
				})
			);
			expect(result.ui.zoomLevel).toEqual(80);
		});

		it("should toggle grid visibility", () => {
			const result = defaultDiagramReducer(initialState, diagramActions.gridVisibilityToggled());
			expect(result.ui.showGrid).toEqual(false);
		});

		it("should handle step size changes", () => {
			const result = defaultDiagramReducer(initialState, diagramActions.gridStepSizeChanged({ gridStepSize: 10 }));
			expect(result.ui.gridStepSize).toEqual(10);
		});
	});

	describe("Selection Actions", () => {
		it("should handle multi-selection", () => {
			let result = defaultDiagramReducer(initialState, diagramActions.elementMultiSelected({ elementId: "node1" }));
			result = defaultDiagramReducer(result, diagramActions.elementMultiSelected({ elementId: "node2" }));

			expect(result.ui.selectedElements).toHaveProperty("node1");
			expect(result.ui.selectedElements).toHaveProperty("node2");
		});

		it("should toggle selection off with multi-select", () => {
			let result = defaultDiagramReducer(initialState, diagramActions.elementMultiSelected({ elementId: "node1" }));
			result = defaultDiagramReducer(result, diagramActions.elementMultiSelected({ elementId: "node2" }));
			result = defaultDiagramReducer(result, diagramActions.elementMultiSelected({ elementId: "node1" }));

			expect(result.ui.selectedElements).toEqual({ node2: true });
		});

		it("should clear selection when canvas is selected", () => {
			let result = defaultDiagramReducer(initialState, diagramActions.elementMultiSelected({ elementId: "node1" }));
			result = defaultDiagramReducer(result, diagramActions.canvasSelected());
			expect(result.ui.selectedElements).toEqual({});
		});
	});

	describe("Readonly Actions", () => {
		it("should set element to readonly", () => {
			const result = defaultDiagramReducer(initialState, diagramActions.elementSetToReadonly({ elementId: "node1" }));
			expect(result.ui.readonlyElements).toEqual({ node1: true });
		});

		it("should unset readonly element", () => {
			const state = defaultDiagramReducer(initialState, diagramActions.elementSetToNotReadonly({ elementId: "node1" }));
			const result = defaultDiagramReducer(state, diagramActions.readonlyElementsCleared());
			expect(result.ui.readonlyElements).toEqual({});
		});
	});

	describe("Diagram Actions", () => {
		it("should load diagram", () => {
			const result = defaultDiagramReducer(undefined, diagramActions.diagramLoaded({ diagram: initialState.diagram }));
			expect(result.diagram).toEqual(initialState.diagram);
		});
	});
});

const connectedEdge = createConnectedEdge({
	id: "edge1",
	sourceNodeId: "node1",
	targetNodeId: "node2",
	anchors: [
		{ id: "a1", x: 0, y: 0 },
		{ id: "a2", x: 0, y: 100 },
		{ id: "a3", x: 100, y: 100 }
	]
});

const unconnectedEdge = createUnconnectedEdge({
	id: "unconnectedEdge",
	sourceNodeId: "node1",
	sourcePortId: "port1",
	anchors: [
		{ id: "a1", x: 0, y: 0 },
		{ id: "a2", x: 100, y: 100 }
	]
});

const node1 = createNode({
	id: "node1",
	ports: { port1: { id: "port1", type: "port", width: 8, height: 8, offset: { left: 0, top: 0 } } }
});

const node2 = createNode({
	id: "node2",
	ports: { port2: { id: "port2", type: "port", width: 8, height: 8, offset: { left: 0, top: 0 } } }
});

const initialState: DiagramState = createDiagramState({
	canvasId: "canvas-1",
	diagram: { edges: { [connectedEdge.id]: connectedEdge }, nodes: { [node1.id]: node1, [node2.id]: node2 } }
});
