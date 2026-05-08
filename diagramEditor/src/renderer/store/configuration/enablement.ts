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



import { AnyAction } from "@reduxjs/toolkit";

import {
	Anchor,
	ConnectedDiagramEdge,
	isConnectedEdge,
	isUnconnectedEdge,
	UnconnectedDiagramEdge
} from "../../../core/diagram/edge";
import { Vector } from "../../../core/geometry";
import { DiagramState } from "../../../core/state";
import { DiagramNode } from "../../../core/diagram/node";
import { DiagramElement } from "../../../core/diagram/diagramElement";
import { DiagramPort } from "../../../core/diagram/port";
import { assertExists, requireArgument } from "../../../core/assertions";
import { canElementMove } from "../../../core/features/moveElements";
import { canNodeMove } from "../../../core/features/moveNode";
import { canSegmentMove } from "../../../core/features/moveEdgeSegment";
import { DiagramDialog } from "../../../core/features/dialog";
import { canEdgeDisconnect } from "../../../core/features/disconnectEdge";
import { canMoveEdgeEnd } from "../../../core/features/moveEdgeEnd";
import { canMoveEdgeAnchor } from "../../../core/features/moveEdgeAnchor";
import { DiagramContainer } from "../../../core/diagram/container";
import { canAddElementToContainer } from "../../../core/features/addElementToContainer";
import { canContainerMove } from "../../../core/features/moveContainer";
import { canRemoveElementFromContainer } from "../../../core/features/removeElementFromContainer";
import { ResizePointOrientation } from "../../../core/features/resizeElement";

import { diagramActions } from "../slice";

interface ConfirmationRequired {
	dialog: DiagramDialog;
}

export function isConfirmationRequiredEnablement(enablement: DiagramEnablement): enablement is ConfirmationRequired {
	return enablement !== true && enablement !== false;
}

type DiagramEnablement = boolean | ConfirmationRequired;

interface RequiredDiagramEnablementMap {
	canZoomCanvas(scrollDelta: number, state: DiagramState): DiagramEnablement;
	canPanCanvas(vector: Vector, state: DiagramState): DiagramEnablement;
	canMoveNode(node: DiagramNode, vector: Vector, state: DiagramState): DiagramEnablement;
	canMoveContainer(container: DiagramContainer, vector: Vector, state: DiagramState): DiagramEnablement;
	canAddElementToContainer(
		element: DiagramNode | DiagramContainer,
		container: DiagramContainer,
		state: DiagramState
	): DiagramEnablement;
	canRemoveElementFromContainer(
		element: DiagramNode | DiagramContainer,
		container: DiagramContainer,
		state: DiagramState
	): DiagramEnablement;
	canMoveEdgeSegment(
		anchor: Anchor,
		parentEdge: ConnectedDiagramEdge,
		vector: Vector,
		state: DiagramState
	): DiagramEnablement;
	canMoveMultipleElements(
		draggedElement: DiagramElement,
		elements: DiagramElement[],
		vector: Vector,
		state: DiagramState
	): DiagramEnablement;
	canDisconnectEdge(
		edge: ConnectedDiagramEdge,
		node: DiagramNode,
		port: DiagramPort,
		state: DiagramState
	): DiagramEnablement;
	canConnectEdgeToPort(
		edge: UnconnectedDiagramEdge,
		parentElement: DiagramNode | DiagramContainer,
		port: DiagramPort,
		state: DiagramState
	): DiagramEnablement;
	canCreateEdge(
		edge: UnconnectedDiagramEdge,
		node: DiagramNode,
		port: DiagramPort,
		state: DiagramState
	): DiagramEnablement;
	canMoveEdgeEnd(edge: ConnectedDiagramEdge, anchor: Anchor, vector: Vector, state: DiagramState): DiagramEnablement;
	canMoveEdgeAnchor(edge: ConnectedDiagramEdge, anchor: Anchor, vector: Vector, state: DiagramState): DiagramEnablement;
	canSelectElement(element: DiagramElement, state: DiagramState): DiagramEnablement;
	canMultiSelectElement(element: DiagramElement, state: DiagramState): DiagramEnablement;
	canRemoveElements(elements: DiagramElement[], state: DiagramState): DiagramEnablement;
	canResizeElement(
		element: DiagramNode | DiagramContainer,
		vector: Vector,
		orientation: ResizePointOrientation,
		state: DiagramState
	): DiagramEnablement;
}

export type DiagramEnablementMap = Partial<RequiredDiagramEnablementMap>;

/**
 * @internal
 */
export function resolveEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	const enablementFunctions = [
		resolveCanvasZoomedEnablement,
		resolveCanvasDraggedEnablement,
		resolveNodeMovedEnablement,
		resolveElementsAddedToContainerEnablement,
		resolveElementsRemovedFromContainerEnablement,
		resolveContainerMovedEnablement,
		resolveSegmentMovedEnablement,
		resolveEdgeEndMovedEnablement,
		resolveEdgeAnchorMovedEnablement,
		resolveElementsMovedEnablement,
		resolveCreateEdgeEnablement,
		resolveEdgeConnectedEnablement,
		resolveEdgeDisconnectedEnablement,
		resolveElementSelectedEnablement,
		resolveElementMultiSelectedEnablement,
		resolveElementsRemovedEnablement,
		resolveResizeEnablement
	];

	for (const resolveEnablement of enablementFunctions) {
		const enablement = resolveEnablement(action, state, enablements);
		if (enablement === false) {
			return false;
		} else if (isConfirmationRequiredEnablement(enablement)) {
			return enablement;
		}
	}

	return true;
}

function resolveCanvasZoomedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.canvasZoomed.match(action) && enablements.canZoomCanvas) {
		return enablements.canZoomCanvas(action.payload.scrollDelta, state);
	}
	return true;
}

function resolveCanvasDraggedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.canvasDragged.match(action) && enablements.canPanCanvas) {
		return enablements.canPanCanvas(action.payload.vector, state);
	}
	return true;
}

function resolveNodeMovedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.singleNodeMoved.match(action) && enablements.canMoveNode) {
		const { readonlyElements } = state.ui;
		const { nodeId, vector } = action.payload;
		if (enablements.canMoveNode) {
			const node = state.diagram.nodes[nodeId];
			assertExists(node, `Node with id ${nodeId} not found in diagram`);
			return enablements.canMoveNode(node, vector, state);
		} else {
			return canNodeMove(nodeId, readonlyElements);
		}
	}
	return true;
}

function resolveElementsAddedToContainerEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.elementsAddedToContainer.match(action)) {
		const { elementIds, containerId } = action.payload;
		for (const elementId of elementIds) {
			if (enablements.canAddElementToContainer) {
				const element = state.diagram.nodes[elementId] ?? state.diagram.containers[elementId];
				const container = state.diagram.containers[containerId];
				if (!enablements.canAddElementToContainer(element, container, state)) {
					return false;
				}
			}
			if (!canAddElementToContainer(elementId, containerId, state.ui.readonlyElements, state.diagram)) {
				return false;
			}
		}
	}

	return true;
}

function resolveElementsRemovedFromContainerEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.elementsRemovedFromContainer.match(action)) {
		const { elementIds, containerId } = action.payload;

		for (const elementId of elementIds) {
			if (enablements.canRemoveElementFromContainer) {
				const element = state.diagram.nodes[elementId] ?? state.diagram.containers[elementId];
				const container = state.diagram.containers[containerId];
				if (!enablements.canRemoveElementFromContainer(element, container, state)) {
					return false;
				}
			}
			if (!canRemoveElementFromContainer(containerId, state.ui.readonlyElements)) {
				return false;
			}
		}
	}

	return true;
}

function resolveContainerMovedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.containerMoved.match(action)) {
		const { containerId, vector } = action.payload;
		if (enablements.canMoveContainer) {
			const container = state.diagram.containers[containerId];
			return enablements.canMoveContainer(container, vector, state);
		}
		return canContainerMove(containerId, state.ui.readonlyElements);
	}
	return true;
}

function resolveSegmentMovedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.singleSegmentMoved.match(action)) {
		const { selectedElements, readonlyElements } = state.ui;
		const { anchorId, parentEdgeId, vector } = action.payload;
		if (enablements.canMoveEdgeSegment) {
			const edge = state.diagram.edges[parentEdgeId];
			const anchor = edge.anchors.find(a => a.id === anchorId);
			assertExists(anchor, `Anchor with id ${anchorId} not found in edge ${parentEdgeId}`);
			requireArgument(isConnectedEdge(edge), "Segment movement is only allowed for connected edges");
			return enablements.canMoveEdgeSegment(anchor, edge, vector, state);
		} else {
			return canSegmentMove(parentEdgeId, selectedElements, readonlyElements);
		}
	}
	return true;
}

function resolveElementsMovedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.elementsMoved.match(action) && enablements.canMoveMultipleElements) {
		const { selectedElements, readonlyElements } = state.ui;
		const { draggedElementId, vector } = action.payload;
		if (enablements.canMoveMultipleElements) {
			const draggedElement = state.diagram.nodes[draggedElementId] || state.diagram.edges[draggedElementId];
			const selectedElementsArray = Object.keys(selectedElements).map(
				id => state.diagram.nodes[id] || state.diagram.edges[id]
			);
			return enablements.canMoveMultipleElements(draggedElement, selectedElementsArray, vector, state);
		} else {
			return canElementMove(draggedElementId, selectedElements, readonlyElements, state.diagram);
		}
	}
	return true;
}

function resolveEdgeConnectedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.edgeConnected.match(action) && enablements.canConnectEdgeToPort) {
		const { edgeId, portId } = action.payload;
		const edge = state.diagram.edges[edgeId];
		const element = Object.values({ ...state.diagram.nodes, ...state.diagram.containers }).find(
			element => element.ports[portId]
		);
		const port = element?.ports[portId];
		assertExists(port, `Port with id ${portId} not found in diagram`);
		requireArgument(isUnconnectedEdge(edge), "Edge connection is only allowed for unconnected edges");
		return enablements.canConnectEdgeToPort(edge, element, port, state);
	}
	return true;
}

function resolveCreateEdgeEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.newEdgeCreated.match(action) && enablements.canCreateEdge) {
		const { edge } = action.payload;
		requireArgument(isUnconnectedEdge(edge), "New edge creation is only allowed for unconnected edges");
		const connectedNodeId = edge.sourceNodeId ?? edge.targetNodeId;
		const connectedPortId = edge.sourcePortId ?? edge.targetPortId;
		assertExists(connectedNodeId, "New edge must be connected to a node");
		assertExists(connectedPortId, "New edge must be connected to a port");
		const node = state.diagram.nodes[connectedNodeId];
		const port = node.ports[connectedPortId];
		assertExists(port, `Port with id ${connectedPortId} not found in diagram`);
		return enablements.canCreateEdge(edge, node, port, state);
	}

	return true;
}

function resolveEdgeDisconnectedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.edgeDisconnected.match(action)) {
		const { edgeId, portId } = action.payload;
		if (enablements.canDisconnectEdge) {
			const edge = state.diagram.edges[edgeId];
			const node = Object.values(state.diagram.nodes).find(node => node.ports[portId]);
			const port = node?.ports[portId];
			assertExists(port, `Port with id ${portId} not found in diagram`);
			requireArgument(isConnectedEdge(edge), "Edge disconnection is only allowed for connected edges");
			return enablements.canDisconnectEdge(edge, node, port, state);
		} else {
			return canEdgeDisconnect(edgeId, state.ui.readonlyElements);
		}
	}

	return true;
}

function resolveEdgeEndMovedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.edgeEndMoved.match(action)) {
		const { edgeId, anchorId, vector } = action.payload;
		if (enablements.canMoveEdgeEnd) {
			const edge = state.diagram.edges[edgeId];
			const anchor = edge.anchors.find(a => a.id === anchorId);
			assertExists(anchor, `Anchor with id ${anchorId} not found in edge ${edgeId}`);
			requireArgument(isConnectedEdge(edge), "Edge end movement is only allowed for connected edges");
			return enablements.canMoveEdgeEnd(edge, anchor, vector, state);
		} else {
			return canMoveEdgeEnd(edgeId, state.ui.readonlyElements);
		}
	}
	return true;
}

function resolveEdgeAnchorMovedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.edgeAnchorMoved.match(action)) {
		const { parentEdgeId, anchorId, vector } = action.payload;
		if (enablements.canMoveEdgeAnchor) {
			const edge = state.diagram.edges[parentEdgeId];
			const anchor = edge.anchors.find(a => a.id === anchorId);
			assertExists(anchor, `Anchor with id ${anchorId} not found in edge ${parentEdgeId}`);
			requireArgument(isConnectedEdge(edge), "Edge anchor movement is only allowed for connected edges");
			return enablements.canMoveEdgeAnchor(edge, anchor, vector, state);
		}

		return canMoveEdgeAnchor(parentEdgeId, state.ui.readonlyElements);
	}

	return true;
}

function resolveElementSelectedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.elementSelected.match(action) && enablements.canSelectElement) {
		const { elementId } = action.payload;
		const element =
			state.diagram.nodes[elementId] || state.diagram.edges[elementId] || state.diagram.containers[elementId];
		return enablements.canSelectElement(element, state);
	}
	return true;
}

function resolveElementMultiSelectedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.elementMultiSelected.match(action) && enablements.canMultiSelectElement) {
		const { elementId } = action.payload;
		const element =
			state.diagram.nodes[elementId] || state.diagram.edges[elementId] || state.diagram.containers[elementId];
		return enablements.canMultiSelectElement(element, state);
	}
	return true;
}

function resolveElementsRemovedEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.elementsRemoved.match(action) && enablements.canRemoveElements) {
		const elements = action.payload.elementIds.map(
			id => state.diagram.nodes[id] || state.diagram.edges[id] || state.diagram.containers[id]
		);
		return enablements.canRemoveElements(elements, state);
	}

	return true;
}

function resolveResizeEnablement(
	action: AnyAction,
	state: DiagramState,
	enablements: DiagramEnablementMap
): DiagramEnablement {
	if (diagramActions.elementResized.match(action) && enablements.canResizeElement) {
		const { elementId, vector, orientation } = action.payload;
		const element = state.diagram.nodes[elementId] || state.diagram.edges[elementId];
		return enablements.canResizeElement(element, vector, orientation, state);
	}
	return true;
}
