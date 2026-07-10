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

import "immer";

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { merge } from "lodash";

import type { Diagram } from "../../core/diagram/diagram";
import type { DiagramEdge, UnconnectedDiagramEdge } from "../../core/diagram/edge";
import { centerCanvas, centerNode } from "../../core/features/centerElements";
import { connectEdge } from "../../core/features/connectEdge";
import { disconnectEdge } from "../../core/features/disconnectEdge";
import { moveEdgeEnd } from "../../core/features/moveEdgeEnd";
import { moveElements } from "../../core/features/moveElements";
import { moveNode } from "../../core/features/moveNode";
import { moveSegment } from "../../core/features/moveEdgeSegment";
import { panCanvas } from "../../core/features/panCanvas";
import { removeElements } from "../../core/features/removeElements";
import { applyZoom } from "../../core/features/zoomCanvas";
import type { DiagramState, UIState } from "../../core/state";
import { insertContainer, insertEdge, insertNode, updateContainer, updateEdge, updateNode } from "../../core/state";
import { generateId } from "../../core/generateId";
import { layoutDiagram } from "../../core/features/layout";
import type { Area, Point, Rectangle, Vector } from "../../core/geometry";
import { selectElementsInArea, toggleSelectedElement } from "../../core/features/multiSelection";
import type { DiagramNode } from "../../core/diagram/node";
import { moveEdgeAnchor, moveEdgeAnchorEnded } from "../../core/features/moveEdgeAnchor";
import { moveElementToBackground, moveElementToForeground } from "../../core/features/setElementOrder";
import { moveContainer } from "../../core/features/moveContainer";
import { addElementToContainer } from "../../core/features/addElementToContainer";
import { removeElementFromContainer } from "../../core/features/removeElementFromContainer";
import type { ResizePointOrientation } from "../../core/features/resizeElement";
import { resizeElement } from "../../core/features/resizeElement";
import type { DiagramContainer } from "../../core/diagram/container";
import { setElementReadonly, unsetElementReadonly } from "../../core/features/setElementsReadonly";
import type { DeepPartial } from "../../core/types";

export function createDiagramState(uiState?: Partial<UIState>, diagram?: Partial<Diagram>): DiagramState {
	return {
		canvasId: generateId("canvas"),
		diagram: merge({ edges: {}, nodes: {}, containers: {} }, diagram),
		ui: merge(
			{
				readonly: false,
				zoomLevel: 100,
				showGrid: true,
				gridStepSize: 1,
				offset: { left: 0, top: 0 },
				readonlyElements: {},
				selectedElements: {},
				foregroundElements: [],
				backgroundElements: [],
				isDragging: false
			},
			uiState
		)
	};
}

const slice = createSlice({
	name: "diagram-editor-slice",
	initialState: createDiagramState(),
	reducers: {
		canvasDragged(state, action: PayloadAction<{ vector: Vector }>) {
			state.ui = panCanvas(action.payload.vector, state.ui);
		},
		canvasZoomed(state, action: PayloadAction<{ scrollDelta: number; diagramPosition: Point }>) {
			const { scrollDelta, diagramPosition } = action.payload;
			state.ui = applyZoom(scrollDelta, state.ui, diagramPosition);
		},
		singleNodeMoved(state, action: PayloadAction<{ nodeId: string; vector: Vector }>) {
			state.diagram = moveNode(action.payload.nodeId, action.payload.vector, state.diagram);
			state.ui.isDragging = true;
		},
		nodeAdded(state, action: PayloadAction<{ node: DiagramNode }>) {
			state.diagram = insertNode(action.payload.node, state).diagram;
		},
		nodeUpdated(state, action: PayloadAction<{ nodeId: string; updates: Partial<DiagramNode> }>) {
			const { nodeId, updates } = action.payload;
			const node = state.diagram.nodes[nodeId];
			state.diagram = updateNode({ ...node, ...updates }, state).diagram;
		},
		containerUpdated(state, action: PayloadAction<{ containerId: string; updates: Partial<DiagramContainer> }>) {
			const { containerId, updates } = action.payload;
			const container = state.diagram.containers[containerId];
			state.diagram = updateContainer({ ...container, ...updates }, state).diagram;
		},
		elementsAddedToContainer(state, action: PayloadAction<{ elementIds: string[]; containerId: string }>) {
			const { elementIds, containerId } = action.payload;
			for (const elementId of elementIds) {
				state.diagram = addElementToContainer(elementId, containerId, state.diagram);
			}
		},
		elementsRemovedFromContainer(state, action: PayloadAction<{ elementIds: string[]; containerId: string }>) {
			const { elementIds, containerId } = action.payload;
			for (const elementId of elementIds) {
				state.diagram = removeElementFromContainer(elementId, containerId, state.diagram);
			}
		},
		containerMoved(state, action: PayloadAction<{ containerId: string; vector: Vector }>) {
			state.diagram = moveContainer(action.payload.containerId, action.payload.vector, state.diagram);
			state.ui.isDragging = true;
		},
		containerAdded(state, action: PayloadAction<{ container: DiagramContainer }>) {
			state.diagram = insertContainer(action.payload.container, state).diagram;
		},
		singleSegmentMoved(state, action: PayloadAction<{ anchorId: string; parentEdgeId: string; vector: Vector }>) {
			state.diagram = moveSegment(
				action.payload.parentEdgeId,
				action.payload.anchorId,
				action.payload.vector,
				state.diagram
			);
			state.ui.isDragging = true;
		},
		edgeEndMoved(state, action: PayloadAction<{ edgeId: string; anchorId: string; vector: Vector }>) {
			const { edgeId, anchorId, vector } = action.payload;
			state.diagram = moveEdgeEnd(edgeId, anchorId, vector, state.diagram);
			state.ui.isDragging = true;
		},
		edgeAnchorMoved(state, action: PayloadAction<{ parentEdgeId: string; anchorId: string; vector: Vector }>) {
			const { parentEdgeId, anchorId, vector } = action.payload;
			state.diagram = moveEdgeAnchor(parentEdgeId, anchorId, vector, state.diagram);
			state.ui.isDragging = true;
		},
		edgeAnchorMovedEnded(state, action: PayloadAction<{ parentEdgeId: string; anchorId: string }>) {
			const { parentEdgeId, anchorId } = action.payload;
			state.diagram = moveEdgeAnchorEnded(parentEdgeId, anchorId, state.diagram);
			state.ui.isDragging = false;
		},
		newEdgeCreated(state, action: PayloadAction<{ edge: UnconnectedDiagramEdge }>) {
			state.backup = shallowCloneDiagram(state.diagram);
			state.diagram.edges[action.payload.edge.id] = action.payload.edge;
			state.ui.selectedElements = { [action.payload.edge.id]: true };
		},
		edgeAdded(state, action: PayloadAction<{ edge: DiagramEdge }>) {
			state.diagram = insertEdge(action.payload.edge, state).diagram;
		},
		edgeDisconnected(state, action: PayloadAction<{ edgeId: string; portId: string }>) {
			const { edgeId, portId } = action.payload;
			state.backup = shallowCloneDiagram(state.diagram);
			state.diagram = disconnectEdge(edgeId, portId, state.diagram);
			state.ui.selectedElements = { [edgeId]: true };
		},
		edgeConnected(state, action: PayloadAction<{ edgeId: string; portId: string }>) {
			state.diagram = connectEdge(action.payload.edgeId, action.payload.portId, state);
			state.backup = undefined;
		},
		edgeUpdated(state, action: PayloadAction<{ edgeId: string; updates: DeepPartial<DiagramEdge> }>) {
			const { edgeId, updates } = action.payload;
			const edge = state.diagram.edges[edgeId];
			state.diagram = updateEdge(merge(edge, updates), state).diagram;
		},
		connectEdgeCancelled(state) {
			if (state.backup) {
				state.diagram = state.backup;
				state.backup = undefined;
			}
		},
		elementsMoved(state, action: PayloadAction<{ draggedElementId: string; vector: Vector }>) {
			state.diagram = moveElements(
				Object.keys(state.ui.selectedElements),
				state.ui.readonlyElements,
				action.payload.vector,
				state.diagram
			);
			state.ui.isDragging = true;
		},
		dragEnded(state) {
			state.ui.isDragging = false;
		},
		diagramLayouted(state) {
			state.diagram = layoutDiagram(state.diagram);
		},
		diagramLoaded(state, action: PayloadAction<{ diagram: Diagram }>) {
			state.diagram = action.payload.diagram;
		},
		canvasSelected(state) {
			state.ui.selectedElements = {};
		},
		elementMultiSelected(state, action: PayloadAction<{ elementId: string }>) {
			state.ui.selectedElements = toggleSelectedElement(state.ui.selectedElements, action.payload.elementId);
		},
		elementSelected(state, action: PayloadAction<{ elementId: string }>) {
			if (!state.ui.selectedElements[action.payload.elementId]) {
				state.ui.selectedElements = { [action.payload.elementId]: true };
			}
			state.ui.isDragging = true;
		},
		onMouseMultiselection(state, action: PayloadAction<Area>) {
			state.ui.selectedElements = selectElementsInArea(state.diagram, action.payload);
		},
		elementResized(
			state,
			action: PayloadAction<{ elementId: string; orientation: ResizePointOrientation; vector: Vector }>
		) {
			const { elementId, orientation, vector } = action.payload;
			state.diagram = resizeElement(elementId, orientation, vector, state.diagram);
		},
		centerNode(state, action: PayloadAction<{ nodeId: string; canvasDimensions: Rectangle }>) {
			const { nodeId, canvasDimensions } = action.payload;
			state.ui = centerNode(nodeId, state.diagram, state.ui, canvasDimensions);
		},
		canvasCentered(state, action: PayloadAction<{ canvasDimensions: Rectangle }>) {
			const { canvasDimensions } = action.payload;
			state.ui = centerCanvas(state.diagram, state.ui, canvasDimensions);
		},
		gridVisibilityToggled(state) {
			state.ui.showGrid = !state.ui.showGrid;
		},
		elementSetToReadonly(state, action: PayloadAction<{ elementId: string }>) {
			state.ui = setElementReadonly(action.payload.elementId, state).ui;
		},
		elementSetToNotReadonly(state, action: PayloadAction<{ elementId: string }>) {
			state.ui = unsetElementReadonly(action.payload.elementId, state).ui;
		},
		readonlyElementsCleared(state) {
			state.ui.readonlyElements = {};
		},
		elementsRemoved(state, action: PayloadAction<{ elementIds: string[] }>) {
			const { diagram, ui } = removeElements(state, action.payload.elementIds);
			state.diagram = diagram;
			state.ui = ui;
		},
		gridStepSizeChanged(state, action: PayloadAction<{ gridStepSize: number }>) {
			state.ui.gridStepSize = action.payload.gridStepSize;
		},
		readonlyChanged(state, action: PayloadAction<{ readonly: boolean }>) {
			state.ui.readonly = action.payload.readonly;
		},
		elementMovedToForeground(state, action: PayloadAction<{ elementId: string }>) {
			state.ui = moveElementToForeground(action.payload.elementId, state.ui);
		},
		elementMovedToBackground(state, action: PayloadAction<{ elementId: string }>) {
			state.ui = moveElementToBackground(action.payload.elementId, state.ui);
		},
		confirmDialog(state) {
			state.dialog = undefined;
			state.backup = undefined;
		},
		cancelDialog(state) {
			state.diagram = state.backup ?? state.diagram;
			state.dialog = undefined;
			state.backup = undefined;
		}
	}
});

// Creating a shallow clone is necessary to be able to modify the diagram without mutating the original state within a reducer
function shallowCloneDiagram(diagram: Diagram): Diagram {
	return { nodes: { ...diagram.nodes }, edges: { ...diagram.edges }, containers: { ...diagram.containers } };
}

export const defaultDiagramReducer = slice.reducer;
export const diagramActions = slice.actions;
