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


import { Action } from "@reduxjs/toolkit";

import { ActivityReducers } from "@com.mgmtp.a12.client/client-core/lib/core/activity";
import { Activity } from "@com.mgmtp.a12.client/client-core/lib/core/activity";
import {
	isConnectedEdge,
	getConnectedElements
} from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/edge";
import { canNodeMove } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/features/moveNode";
import { DiagramState, updateEdge } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/state";
import { DiagramEnablementMap } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/store/configuration/enablement";
import { createDiagramReducer } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/store/reducer";
import {
	defaultDiagramReducer,
	diagramActions
} from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/store/slice";
import { isConfirmedAction } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/features/dialog";

import { DIAMOND_NODE_TYPE } from "./customElements/diamondNode";
import { STATIC_NODE_TYPE } from "./customElements/staticNode";
import { STRAIGHT_EDGE_TYPE } from "./customElements/straightEdge";

function isBasicDiagramDataHolder(dh: Activity.DataHolder): dh is Activity.DataHolder {
	return dh.descriptor.diagram === "basic";
}

export const basicDiagramActivityReducer: ActivityReducers.DataReducer = {
	reduce(dataHolders, action) {
		const dataHolder = dataHolders.find(isBasicDiagramDataHolder);
		if (!dataHolder?.data || Object.keys(dataHolder.data).length === 0) {
			return dataHolders;
		}

		const newData = diagramReducer(dataHolder.data as DiagramState, action);
		return [{ ...dataHolder, data: newData }];
	}
};

const diagramReducer = createDiagramReducer({
	enablements: createEnablements(),
	customReducer: (state, action) => {
		const newState = defaultDiagramReducer(state, action);
		return diamondNodeReducer(newState, action);
	}
});

function diamondNodeReducer(state: DiagramState, action: Action): DiagramState {
	if (diagramActions.newEdgeCreated.match(action)) {
		const edge = action.payload.edge;
		const { source, target } = getConnectedElements(edge, state.diagram);

		const element = source ?? target;
		if (element?.customType === DIAMOND_NODE_TYPE) {
			const updatedAction = { ...action, payload: { ...action.payload, customType: STRAIGHT_EDGE_TYPE } };
			return defaultDiagramReducer(state, updatedAction);
		}
	}
	if (diagramActions.edgeConnected.match(action) && isConfirmedAction(action)) {
		const edge = state.diagram.edges[action.payload.edgeId];
		const { source, target } = getConnectedElements(edge, state.diagram);

		if (
			(source?.customType === DIAMOND_NODE_TYPE || target?.customType === DIAMOND_NODE_TYPE) &&
			edge.customType !== STRAIGHT_EDGE_TYPE
		) {
			return updateEdge({ ...edge, customType: STRAIGHT_EDGE_TYPE }, state);
		}
		return state;
	}

	return state;
}

function createEnablements(): DiagramEnablementMap {
	return {
		canMoveNode: (node, _vector, state) =>
			node.customType !== STATIC_NODE_TYPE && canNodeMove(node.id, state.ui.readonlyElements),
		canAddElementToContainer: element => element.customType !== STATIC_NODE_TYPE,
		canSelectElement: element => element.customType !== STATIC_NODE_TYPE,
		canMultiSelectElement: element => element.customType !== STATIC_NODE_TYPE,
		canRemoveElements: () => ({
			dialog: {
				title: "Remove Elements",
				message: "Are you sure you want to remove the selected elements?",
				type: "dialog",
				severity: "warning",
				confirmButton: { label: "Remove", primary: true, destructive: true },
				cancelButton: { label: "Cancel", primary: false, destructive: false }
			}
		}),
		canConnectEdgeToPort: (edge, element, _port, state) => {
			const { source, target } = getConnectedElements(edge, state.diagram);
			const connectedElement = source ?? target;

			if (!connectedElement) {
				return true;
			}

			const otherNode = state.diagram.nodes[connectedElement.id];
			if (otherNode?.customType === DIAMOND_NODE_TYPE && element.customType === DIAMOND_NODE_TYPE) {
				return false;
			}

			if (element.customType === DIAMOND_NODE_TYPE && edge.customType !== STRAIGHT_EDGE_TYPE) {
				return {
					dialog: {
						title: "Change Edge Type",
						message: "The edge type will be changed to a straight edge.",
						type: "dialog",
						customType: "changeEdgeType",
						severity: "info"
					}
				};
			}

			const connectedEdges = Object.values(state.diagram.edges)
				.filter(isConnectedEdge)
				.filter(e => e.sourcePortId === element.id || e.targetPortId === element.id);

			return connectedEdges.length === 0;
		}
	};
}
