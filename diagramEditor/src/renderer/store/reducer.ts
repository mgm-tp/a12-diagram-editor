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

import type { Action } from "@reduxjs/toolkit";

import { isConfirmedAction } from "../../core/features/dialog";
import type { DiagramState } from "../../core/state";
import { restoreBackup } from "../../core/state";

import type { DiagramEnablementMap } from "./configuration/enablement";
import { resolveEnablement, isConfirmationRequiredEnablement } from "./configuration/enablement";
import { createDiagramState, defaultDiagramReducer } from "./slice";

export type DiagramStateReducer = (state: DiagramState, action: Action) => DiagramState;

interface Configuration {
	/**
	 * Functions to determine whether an action can be performed.
	 * This also overrides the default behavior of the diagram editor.
	 * @returns `true` if the action can be performed, `false` if it cannot, or a dialog configuration if a dialog should be shown that either confirms or cancels the action.
	 * @example
	 * enablements: {
	 *   canMoveNode: (node, _vector, state) =>
	 *     node.customType !== STATIC_NODE_TYPE &&
	 *     canNodeMove(node.id, state.ui.selectedElements, state.ui.readonlyElements),
	 *   canRemoveElements: () => ({
	 *     dialog: {
	 *       title: "Remove Elements",
	 *       message: "Are you sure you want to remove the selected elements?",
	 *       type: "dialog",
	 *       severity: "warning",
	 *       confirmButton: { label: "Remove", primary: true, destructive: true },
	 *       cancelButton: { label: "Cancel", primary: false, destructive: false }
	 *     }
	 *   })
	 * }
	 */
	enablements: DiagramEnablementMap;
	/**
	 * Custom reducer function that replaces the default reducer. Call {@link defaultDiagramReducer} to apply the default behavior.
	 * It is recommended to use this extension point instead of creating a custom reducer, that wraps the default diagram reducer,
	 * because enablements might defer an action from being processed.
	 *
	 * @example
	 * customReducer: (state, action) => {
	 * 	 // Example for modifying an action before the default reducer processes it
	 *   if (diagramActions.newEdgeCreated.match(action)) {
	 *     const edge = action.payload;
	 *     const node = getNode(edge.connectedNodeId, state.diagram);
	 *     if (node.customType === DIAMOND_NODE_TYPE) {
	 *       const updatedAction = { ...action, payload: { ...action.payload, customType: STRAIGHT_EDGE_TYPE } };
	 *       return defaultDiagramReducer(state, updatedAction);
	 *     }
	 *   }
	 *   // Example for modifying the state before the default reducer processes it
	 *   else if (diagramActions.edgeConnected.match(action)) {
	 *     const { edgeId, portId } = action.payload;
	 *     const edge = getEdge(edgeId, state.diagram);
	 *     const port = getPort(portId, state.diagram);
	 *     if (port.customType === DIAMOND_PORT_TYPE && edge.customType !== STRAIGHT_EDGE_TYPE) {
	 *       const customEdge = { ...edge, customType: STRAIGHT_EDGE_TYPE };
	 *       const updatedState = updateEdge(customEdge, state);
	 *       return defaultDiagramReducer(updatedState, action);
	 *     }
	 *   }
	 *   // Examples for not passing the action to the default reducer
	 *   else if (diagramActions.elementSelected.match(action)) {
	 *     const selectedElementId = action.payload;
	 *     const node = isNode(selectedElementId, state.diagram) ? getNode(selectedElementId, state.diagram) : undefined;
	 *     return node?.customType === STATIC_NODE_TYPE
	 *       ? { ...state, ui: { ...state.ui, selectedElements: {} } }
	 *       : defaultDiagramReducer(state, action);
	 *   }
	 * }
	 */
	customReducer?: DiagramStateReducer;
}

export type DiagramConfiguration = Partial<Configuration>;

export function createDiagramReducer(configuration: DiagramConfiguration = {}): DiagramStateReducer {
	return (state: DiagramState, action: Action): DiagramState => {
		const { enablements = {}, customReducer } = configuration;
		if (!state || Object.keys(state).length === 0) {
			const initialState = createDiagramState();
			return initialState;
		}

		const enablement = resolveEnablement(action, state, enablements);
		if (!enablement) {
			return restoreBackup(state);
		} else if (isConfirmationRequiredEnablement(enablement) && !isConfirmedAction(action)) {
			return { ...state, dialog: { ...enablement.dialog, confirmAction: { ...action, confirmed: true } } };
		}

		return customReducer?.(state, action) ?? defaultDiagramReducer(state, action);
	};
}
