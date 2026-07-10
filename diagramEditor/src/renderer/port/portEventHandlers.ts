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

import type { MouseEvent } from "react";

import { assertExists } from "../../core/assertions";
import type { DiagramContainer } from "../../core/diagram/container";
import type { ConnectedDiagramEdge } from "../../core/diagram/edge";
import { createUnconnectedEdge } from "../../core/diagram/edge";
import type { DiagramNode } from "../../core/diagram/node";

import { useElementDragging } from "../common/useElementDragging";
import { useDefaultEdgeEventHandlers } from "../edge/edgeEventHandlers";
import { diagramActions } from "../store/slice";
import { useDiagramDispatch, useDiagramState } from "../store/stateContext";
import { useCustomEventHandlers } from "../store/configuration/eventHandlers";

export interface PortEventHandlers {
	onConnectedPortMouseDown: (event: MouseEvent, portId: string, connectedEdge: ConnectedDiagramEdge) => void;
	onUnconnectedPortMouseDown: (event: MouseEvent, portId: string, element: DiagramNode | DiagramContainer) => void;
	onEdgeConnectedToPort: (event: MouseEvent, portId: string, edgeId: string) => void;
}

export function usePortEventHandlers(): PortEventHandlers {
	const eventHandlers = useDefaultPortEventHandlers();
	const customEventHandlers = useCustomEventHandlers();
	return { ...eventHandlers, ...customEventHandlers };
}

export function useDefaultPortEventHandlers(): PortEventHandlers {
	const readonly = useDiagramState(state => state.ui.readonly);
	const enabledEventHandlers = useEnabledPortEventHandlers();
	const readonlyEventHandlers = useReadonlyEventHandlers();
	return readonly ? readonlyEventHandlers : enabledEventHandlers;
}

function useEnabledPortEventHandlers(): PortEventHandlers {
	const dispatch = useDiagramDispatch();
	const startDragging = useElementDragging();
	const { onEdgeEndDragged, onEdgeEndDragEnded } = useDefaultEdgeEventHandlers();

	return {
		onConnectedPortMouseDown: (event, portId, connectedEdge) => {
			dispatch(diagramActions.edgeDisconnected({ edgeId: connectedEdge.id, portId }));
			const anchor = connectedEdge.sourcePortId === portId ? connectedEdge.anchors.at(0) : connectedEdge.anchors.at(-1);
			assertExists(anchor, "Internal Error: Could not resolve anchor to drag");
			startDragging({
				elementId: anchor.id,
				onDrag: (event, vector) => onEdgeEndDragged(event, connectedEdge.id, anchor.id, vector),
				onDragEnd: event => onEdgeEndDragEnded(event, connectedEdge.id, anchor.id)
			});
		},
		onUnconnectedPortMouseDown: (event, portId, node) => {
			const port = node.ports[portId];
			const edge = createUnconnectedEdge(node, port);
			const anchor = edge.anchors.at(-1);
			assertExists(anchor, "Internal Error: Could not resolve anchor to drag");
			dispatch(diagramActions.newEdgeCreated({ edge }));
			startDragging({
				elementId: anchor.id,
				onDrag: (event, vector) => onEdgeEndDragged(event, edge.id, anchor.id, vector),
				onDragEnd: event => onEdgeEndDragEnded(event, edge.id, anchor.id)
			});

			return true;
		},
		onEdgeConnectedToPort: (event, portId, edgeId) => {
			dispatch(diagramActions.edgeConnected({ edgeId, portId }));
		}
	};
}

function useReadonlyEventHandlers(): PortEventHandlers {
	return {
		onConnectedPortMouseDown: () => {},
		onUnconnectedPortMouseDown: () => {},
		onEdgeConnectedToPort: () => {}
	};
}
