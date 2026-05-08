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


import { createDiagramReducer } from "../../src/renderer/store/reducer";
import { diagramActions } from "../../src/renderer/store/slice";
import { DiagramDialog } from "../../src/core/features/dialog";
import { ConnectedDiagramEdge, UnconnectedDiagramEdge } from "../../src/core/diagram/edge";
import { DiagramNode } from "../../src/core/diagram/node";

import {
	createDiagramState,
	createNode,
	createConnectedEdge,
	createUnconnectedEdge,
	createPort
} from "../utils/diagramStateHelper";

describe("Enablements", () => {
	it("should use move node enablement", () => {
		const disabledNode = createNode({ id: "node1" });
		const enabledNode = createNode({ id: "node2" });
		const dialogNode = createNode({ id: "node3" });
		const initialState = createDiagramState({
			diagram: {
				nodes: { [disabledNode.id]: disabledNode, [enabledNode.id]: enabledNode, [dialogNode.id]: dialogNode }
			}
		});
		const moveDisabledNodeAction = createNodeMovedAction(disabledNode.id);
		const moveEnabledNodeAction = createNodeMovedAction(enabledNode.id);
		const moveConfirmationRequiredNodeAction = createNodeMovedAction(dialogNode.id);

		const reducer = createDiagramReducer({
			enablements: {
				canMoveNode: node => {
					if (node.id === disabledNode.id) {
						return false;
					} else if (node.id === dialogNode.id) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});
		let result = reducer(initialState, moveDisabledNodeAction);
		result = reducer(result, moveEnabledNodeAction);
		result = reducer(result, moveConfirmationRequiredNodeAction);

		expect(result.diagram.nodes[disabledNode.id].x).toBe(disabledNode.x);
		expect(result.diagram.nodes[disabledNode.id].y).toBe(disabledNode.y);
		expect(result.diagram.nodes[enabledNode.id].x).toBe(enabledNode.x + 100);
		expect(result.diagram.nodes[enabledNode.id].y).toBe(enabledNode.y + 100);
		expect(result.diagram.nodes[dialogNode.id].x).toBe(dialogNode.x);
		expect(result.diagram.nodes[dialogNode.id].y).toBe(dialogNode.y);
		expect(result.dialog?.confirmAction).toEqual({ ...moveConfirmationRequiredNodeAction, confirmed: true });

		function createNodeMovedAction(nodeId: string) {
			return diagramActions.singleNodeMoved({ nodeId, vector: { x: 100, y: 100 } });
		}
	});

	it("should use move segment enablement", () => {
		const disabledAnchor = { id: "a1", x: 0, y: 0 };
		const enabledAnchor = { id: "a2", x: 0, y: 50 };
		const dialogAnchor = { id: "a3", x: 50, y: 50 };
		const edge = createConnectedEdge({
			id: "testEdge",
			anchors: [disabledAnchor, enabledAnchor, dialogAnchor, { id: "a4", x: 50, y: 0 }]
		});
		const initialState = createDiagramState({ diagram: { edges: { [edge.id]: edge } } });
		const moveDisabledSegmentAction = createEdgeSegmentMovedAction(disabledAnchor.id);
		const moveEnabledSegmentAction = createEdgeSegmentMovedAction(enabledAnchor.id);
		const moveConfirmationRequiredSegmentAction = createEdgeSegmentMovedAction(dialogAnchor.id);

		const reducer = createDiagramReducer({
			enablements: {
				canMoveEdgeSegment: anchor => {
					if (anchor.id === disabledAnchor.id) {
						return false;
					} else if (anchor.id === dialogAnchor.id) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		let result = reducer(initialState, moveDisabledSegmentAction);
		result = reducer(result, moveEnabledSegmentAction);
		result = reducer(result, moveConfirmationRequiredSegmentAction);

		const resultDisabledAnchor = result.diagram.edges[edge.id].anchors.find(a => a.id === disabledAnchor.id);
		const resultEnabledAnchor = result.diagram.edges[edge.id].anchors.find(a => a.id === enabledAnchor.id);
		const resultConfirmationRequiredAnchor = result.diagram.edges[edge.id].anchors.find(a => a.id === dialogAnchor.id);
		expect(resultDisabledAnchor?.x).toBe(0);
		expect(resultDisabledAnchor?.y).toBe(0);
		expect(resultEnabledAnchor?.x).toBe(0);
		expect(resultEnabledAnchor?.y).toBe(70);
		expect(resultConfirmationRequiredAnchor?.x).toBe(50);
		expect(resultConfirmationRequiredAnchor?.y).toBe(70); // was moved by the second action
		expect(result.dialog?.confirmAction).toEqual({ ...moveConfirmationRequiredSegmentAction, confirmed: true });

		function createEdgeSegmentMovedAction(anchorId: string) {
			return diagramActions.singleSegmentMoved({ anchorId, parentEdgeId: edge.id, vector: { x: 20, y: 20 } });
		}
	});

	it("should use move multiple elements enablement", () => {
		const disabledNode = createNode({ id: "node1", x: 0, y: 0 });
		const enabledNode = createNode({ id: "node2", x: 100, y: 100 });
		const dialogNode = createNode({ id: "node3", x: 200, y: 200 });

		const initialState = createDiagramState({
			diagram: {
				nodes: { [disabledNode.id]: disabledNode, [enabledNode.id]: enabledNode, [dialogNode.id]: dialogNode }
			},
			ui: { selectedElements: { [disabledNode.id]: true, [enabledNode.id]: true, [dialogNode.id]: true } }
		});

		const moveDisabledNodeAction = createElementsMovedAction(disabledNode.id);
		const moveEnabledNodeAction = createElementsMovedAction(enabledNode.id);
		const moveDialogNodeAction = createElementsMovedAction(dialogNode.id);

		const reducer = createDiagramReducer({
			enablements: {
				canMoveMultipleElements: draggedElement => {
					if (draggedElement.id === disabledNode.id) {
						return false;
					} else if (draggedElement.id === dialogNode.id) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		let result = reducer(initialState, moveDisabledNodeAction);
		result = reducer(result, moveEnabledNodeAction);
		result = reducer(result, moveDialogNodeAction);

		// Nodes should have been moved once by (50,50)
		expect(result.diagram.nodes[disabledNode.id].x).toBe(disabledNode.x + 50);
		expect(result.diagram.nodes[disabledNode.id].y).toBe(disabledNode.y + 50);
		expect(result.diagram.nodes[enabledNode.id].x).toBe(enabledNode.x + 50);
		expect(result.diagram.nodes[enabledNode.id].y).toBe(enabledNode.y + 50);
		expect(result.dialog?.confirmAction).toEqual({ ...moveDialogNodeAction, confirmed: true });

		function createElementsMovedAction(id: string) {
			return diagramActions.elementsMoved({ draggedElementId: id, vector: { x: 50, y: 50 } });
		}
	});

	it("should use connect edge enablement", () => {
		const disabledPort = createPort({ id: "port1" });
		const enabledPort = createPort({ id: "port2" });
		const dialogPort = createPort({ id: "port3" });

		const sourcePort = createPort({ id: "sourcePort" });
		const sourceNode = createNode({ id: "source", ports: { sourcePort } });
		const targetNode = createNode({
			id: "target",
			ports: { [disabledPort.id]: disabledPort, [enabledPort.id]: enabledPort, [dialogPort.id]: dialogPort }
		});
		const edge = createUnconnectedEdge({ id: "edge", sourceNodeId: sourceNode.id, sourcePortId: sourcePort.id });

		const initialState = createDiagramState({
			diagram: { nodes: { [sourceNode.id]: sourceNode, [targetNode.id]: targetNode }, edges: { [edge.id]: edge } }
		});

		const reducer = createDiagramReducer({
			enablements: {
				canConnectEdgeToPort: (edge, node, port) => {
					if (port.id === disabledPort.id) {
						return false;
					} else if (port.id === dialogPort.id) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		const disabledConnectAction = diagramActions.edgeConnected({ edgeId: edge.id, portId: disabledPort.id });
		const disabledResult = reducer(initialState, disabledConnectAction);
		const disabledEdge = disabledResult.diagram.edges[edge.id] as UnconnectedDiagramEdge;
		expect(disabledEdge.sourcePortId).toBe(edge.sourcePortId);

		const enabledConnectAction = diagramActions.edgeConnected({ edgeId: edge.id, portId: enabledPort.id });
		const enabledResult = reducer(initialState, enabledConnectAction);
		const enabledEdge = enabledResult.diagram.edges[edge.id] as ConnectedDiagramEdge;
		expect(enabledEdge.sourcePortId).toBe(sourcePort.id);
		expect(enabledEdge.targetPortId).toBe(enabledPort.id);

		const dialogConnectAction = diagramActions.edgeConnected({ edgeId: edge.id, portId: dialogPort.id });
		const dialogResult = reducer(initialState, dialogConnectAction);
		const dialogEdge = dialogResult.diagram.edges[edge.id] as UnconnectedDiagramEdge;
		expect(dialogEdge.sourcePortId).toBe(edge.sourcePortId);
		expect(dialogResult.dialog?.confirmAction).toEqual({ ...dialogConnectAction, confirmed: true });
	});

	it("should use create edge enablement", () => {
		const port = createPort({ id: "port" });
		const disabledNode = createNode({ id: "disabledNode", ports: { port } });
		const enabledNode = createNode({ id: "enabledNode", ports: { port } });
		const dialogNode = createNode({ id: "dialogNode", ports: { port } });
		const initialState = createDiagramState({
			diagram: {
				nodes: { [disabledNode.id]: disabledNode, [enabledNode.id]: enabledNode, [dialogNode.id]: dialogNode }
			}
		});

		const reducer = createDiagramReducer({
			enablements: {
				canCreateEdge: (_edge, node) => {
					if (node.id === disabledNode.id) {
						return false;
					} else if (node.id === dialogNode.id) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		const edgeId = "newEdge";
		const disabledAction = createAction(edgeId, disabledNode);
		const disabledResult = reducer(initialState, disabledAction);
		expect(disabledResult.diagram.edges[edgeId]).toBeUndefined();

		const enabledAction = createAction(edgeId, enabledNode);
		const enabledResult = reducer(initialState, enabledAction);
		expect(enabledResult.diagram.edges[edgeId]).toBeDefined();

		const dialogAction = createAction(edgeId, dialogNode);
		const dialogResult = reducer(initialState, dialogAction);
		expect(dialogResult.diagram.edges[edgeId]).toBeUndefined();
		expect(dialogResult.dialog?.confirmAction).toEqual({ ...dialogAction, confirmed: true });

		function createAction(edgeId: string, _node: DiagramNode) {
			const edge = createUnconnectedEdge({
				id: edgeId,
				sourceNodeId: _node.id,
				sourcePortId: Object.values(_node.ports)[0].id
			});
			return diagramActions.newEdgeCreated({ edge });
		}
	});

	it("should use zoom canvas enablement", () => {
		const initialState = createDiagramState({ ui: { zoomLevel: 100 } });
		const disabledZoomAction = diagramActions.canvasZoomed({
			scrollDelta: -1000,
			diagramPosition: { x: 0, y: 0 }
		});
		const enabledZoomAction = diagramActions.canvasZoomed({
			scrollDelta: -10,
			diagramPosition: { x: 0, y: 0 }
		});
		const dialogZoomAction = diagramActions.canvasZoomed({
			scrollDelta: 1000,
			diagramPosition: { x: 0, y: 0 }
		});
		const reducer = createDiagramReducer({
			enablements: {
				canZoomCanvas: (delta, state) => {
					if (state.ui.zoomLevel + delta < 0) {
						return false;
					} else if (state.ui.zoomLevel + delta > 200) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		const disabledResult = reducer(initialState, disabledZoomAction);
		expect(disabledResult.ui.zoomLevel).toBe(100);

		const enabledResult = reducer(initialState, enabledZoomAction);
		expect(enabledResult.ui.zoomLevel).toBeGreaterThan(100);

		const dialogResult = reducer(initialState, dialogZoomAction);
		expect(dialogResult.ui.zoomLevel).toBe(100);
		expect(dialogResult.dialog?.confirmAction).toEqual({ ...dialogZoomAction, confirmed: true });
	});

	it("should be possible to prevent canvas panning", () => {
		const initialState = createDiagramState({ ui: { offset: { top: 0, left: 0 } } });

		const disabledAction = diagramActions.canvasDragged({ vector: { x: -50, y: -50 } });
		const enabledAction = diagramActions.canvasDragged({ vector: { x: 50, y: 50 } });
		const dialogAction = diagramActions.canvasDragged({ vector: { x: 1000, y: 1000 } });

		const reducer = createDiagramReducer({
			enablements: {
				canPanCanvas: (vector, state) => {
					if (state.ui.offset.left + vector.x < 0 || state.ui.offset.top + vector.y < 0) {
						return false;
					}
					if (state.ui.offset.left + vector.x > 500 || state.ui.offset.top + vector.y > 500) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		const disabledResult = reducer(initialState, disabledAction);
		expect(disabledResult.ui.offset).toEqual({ top: 0, left: 0 });

		const enabledResult = reducer(initialState, enabledAction);
		expect(enabledResult.ui.offset).toEqual({ top: 50, left: 50 });

		const dialogResult = reducer(initialState, dialogAction);
		expect(dialogResult.ui.offset).toEqual({ top: 0, left: 0 });
		expect(dialogResult.dialog?.confirmAction).toEqual({ ...dialogAction, confirmed: true });
	});

	it("should be possible to prevent element selection", () => {
		const disabledNode = createNode({ id: "disabledNode" });
		const enabledNode = createNode({ id: "enabledNode" });
		const dialogNode = createNode({ id: "dialogNode" });

		const initialState = createDiagramState({
			diagram: {
				nodes: { [disabledNode.id]: disabledNode, [enabledNode.id]: enabledNode, [dialogNode.id]: dialogNode }
			},
			ui: { selectedElements: {} }
		});

		const reducer = createDiagramReducer({
			enablements: {
				canSelectElement: element => {
					if (element.id === disabledNode.id) {
						return false;
					}
					if (element.id === dialogNode.id) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		const disabledAction = diagramActions.elementSelected({ elementId: disabledNode.id });
		const disabledResult = reducer(initialState, disabledAction);
		expect(disabledResult.ui.selectedElements).toEqual({});

		const enabledAction = diagramActions.elementSelected({ elementId: enabledNode.id });
		const enabledResult = reducer(initialState, enabledAction);
		expect(enabledResult.ui.selectedElements).toEqual({ [enabledNode.id]: true });

		const dialogAction = diagramActions.elementSelected({ elementId: dialogNode.id });
		const dialogResult = reducer(initialState, dialogAction);
		expect(dialogResult.ui.selectedElements).toEqual({});
		expect(dialogResult.dialog?.confirmAction).toEqual({ ...dialogAction, confirmed: true });
	});

	it("should be possible to prevent multi-selection", () => {
		const node1 = createNode({ id: "node1" });
		const disabledNode = createNode({ id: "disabledNode" });
		const enabledNode = createNode({ id: "enabledNode" });
		const dialogNode = createNode({ id: "dialogNode" });

		const initialState = createDiagramState({
			diagram: {
				nodes: { [disabledNode.id]: disabledNode, [enabledNode.id]: enabledNode, [dialogNode.id]: dialogNode }
			},
			ui: { selectedElements: { [node1.id]: true } }
		});

		const reducer = createDiagramReducer({
			enablements: {
				canMultiSelectElement: element => {
					if (disabledNode.id === element.id) {
						return false;
					} else if (dialogNode.id === element.id) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		const disabledActionAction = diagramActions.elementMultiSelected({ elementId: disabledNode.id });
		const result = reducer(initialState, disabledActionAction);
		expect(result.ui.selectedElements).toEqual({ [node1.id]: true });

		const enabledActionAction = diagramActions.elementMultiSelected({ elementId: enabledNode.id });
		const resultEnabled = reducer(initialState, enabledActionAction);
		expect(resultEnabled.ui.selectedElements).toEqual({ [node1.id]: true, [enabledNode.id]: true });

		const dialogActionAction = diagramActions.elementMultiSelected({ elementId: dialogNode.id });
		const resultDialog = reducer(initialState, dialogActionAction);
		expect(resultDialog.ui.selectedElements).toEqual({ [node1.id]: true });
		expect(resultDialog.dialog?.confirmAction).toEqual({ ...dialogActionAction, confirmed: true });
	});

	it("should be possible to prevent removing elements", () => {
		const disabledNode = createNode({ id: "disabledNode" });
		const enabledNode = createNode({ id: "enabledNode" });
		const dialogNode = createNode({ id: "dialogNode" });

		const reducer = createDiagramReducer({
			enablements: {
				canRemoveElements: elements => {
					if (elements.some(el => el.id === disabledNode.id)) {
						return false;
					} else if (elements.some(el => el.id === dialogNode.id)) {
						return { dialog: createDialog() };
					}
					return true;
				}
			}
		});

		const disabledAction = diagramActions.elementsRemoved({ elementIds: [disabledNode.id] });
		const disabledState = createState(disabledNode.id, enabledNode.id, dialogNode.id);
		const disabledResult = reducer(disabledState, disabledAction);
		expect(disabledResult.diagram.nodes[disabledNode.id]).toBeDefined();
		expect(disabledResult.diagram.nodes[enabledNode.id]).toBeDefined();

		const enabledAction = diagramActions.elementsRemoved({ elementIds: [enabledNode.id] });
		const enabledState = createState(enabledNode.id);
		const enabledResult = reducer(enabledState, enabledAction);
		expect(enabledResult.diagram.nodes[enabledNode.id]).toBeUndefined();

		const dialogAction = diagramActions.elementsRemoved({ elementIds: [dialogNode.id] });
		const dialogState = createState(dialogNode.id, enabledNode.id);
		const dialogResult = reducer(dialogState, dialogAction);
		expect(dialogResult.diagram.nodes).toEqual(dialogState.diagram.nodes);
		expect(dialogResult.dialog?.confirmAction).toEqual({ ...dialogAction, confirmed: true });

		function createState(...selectedNodes: string[]) {
			return createDiagramState({
				diagram: {
					nodes: { [disabledNode.id]: disabledNode, [enabledNode.id]: enabledNode, [dialogNode.id]: dialogNode }
				},
				ui: { selectedElements: selectedNodes.reduce((acc, id) => ({ ...acc, [id]: true }), {}) }
			});
		}
	});
});

function createDialog(): DiagramDialog {
	return {
		title: "Dialog Title",
		message: "Dialog Message",
		severity: "info",
		type: "dialog"
	};
}
