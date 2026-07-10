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

import type { DiagramState } from "../../src/core/state";
import { defaultDiagramReducer, diagramActions } from "../../src/renderer/store/slice";
import type { DiagramContainer } from "../../src/core/diagram/container";

import {
	createConnectedEdge,
	createNode,
	createDiagramState,
	createUnconnectedEdge
} from "../utils/diagramStateHelper";

describe("UI State", () => {
	describe("isDragging", () => {
		it("update correctly for nodes", () => {
			const startState = defaultDiagramReducer(
				initialState,
				diagramActions.singleNodeMoved({ nodeId: node1.id, vector: { x: 10, y: 10 } })
			);
			expect(startState.ui.isDragging).toBe(true);

			const endState = defaultDiagramReducer(startState, diagramActions.dragEnded());
			expect(endState.ui.isDragging).toBe(false);
		});

		it("update correctly for edges", () => {
			const startState = defaultDiagramReducer(
				initialState,
				diagramActions.singleSegmentMoved({ anchorId: "a1", parentEdgeId: connectedEdge.id, vector: { x: 10, y: 10 } })
			);
			expect(startState.ui.isDragging).toBe(true);

			const endState = defaultDiagramReducer(startState, diagramActions.dragEnded());
			expect(endState.ui.isDragging).toBe(false);
		});

		it("update correctly for edge anchors", () => {
			const startState = defaultDiagramReducer(
				initialState,
				diagramActions.edgeAnchorMoved({ parentEdgeId: connectedEdge.id, anchorId: "a2", vector: { x: 15, y: 20 } })
			);
			expect(startState.ui.isDragging).toBe(true);

			const endState = defaultDiagramReducer(
				startState,
				diagramActions.edgeAnchorMovedEnded({ anchorId: "a2", parentEdgeId: connectedEdge.id })
			);
			expect(endState.ui.isDragging).toBe(false);
		});

		it("update correctly for edge ends", () => {
			const stateWithUnconnectedEdge = {
				...initialState,
				diagram: {
					...initialState.diagram,
					edges: { ...initialState.diagram.edges, [unconnectedEdge.id]: unconnectedEdge }
				}
			};

			const startState = defaultDiagramReducer(
				stateWithUnconnectedEdge,
				diagramActions.edgeEndMoved({ edgeId: unconnectedEdge.id, anchorId: "a2", vector: { x: 25, y: 30 } })
			);
			expect(startState.ui.isDragging).toBe(true);

			const endState = defaultDiagramReducer(startState, diagramActions.dragEnded());
			expect(endState.ui.isDragging).toBe(false);
		});

		it("update correctly for containers", () => {
			const stateWithContainer = {
				...initialState,
				diagram: { ...initialState.diagram, containers: { [container.id]: container } }
			};

			const startState = defaultDiagramReducer(
				stateWithContainer,
				diagramActions.containerMoved({ containerId: container.id, vector: { x: 20, y: 25 } })
			);
			expect(startState.ui.isDragging).toBe(true);

			const endState = defaultDiagramReducer(startState, diagramActions.dragEnded());
			expect(endState.ui.isDragging).toBe(false);
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

const container: DiagramContainer = {
	id: "container1",
	type: "container",
	x: 200,
	y: 200,
	width: 300,
	height: 200,
	label: "Test Container",
	ports: {},
	children: []
};

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
