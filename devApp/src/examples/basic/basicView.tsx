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



import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core/lib/core/activity";
import { View } from "@com.mgmtp.a12.client/client-core/lib/core/view";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramActions";
import { A12DiagramWidget } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramWidget";
import { DiagramState } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/state";
import {
	DiagramEventHandlerMap,
	useDefaultEventHandlers
} from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/store/configuration/eventHandlers";

import { OperationsBox } from "../../components/operationsBox";
import { ElementEditor } from "../../components/elementEditor/elementEditor";
import { DropArea } from "../../components/dropArea";

import { ActivityIdContext } from "../activityIdContext";

import { ChangeEdgeTypeDialog, DIAMOND_PORT_TYPE } from "./customElements/changeEdgeTypeDialog";
import { DIAMOND_NODE_TYPE, DiamondNodeWidget } from "./customElements/diamondNode";
import { DiamondPortWidget } from "./customElements/diamondPort";
import { STATIC_NODE_TYPE, StaticNodeWidget } from "./customElements/staticNode";
import { STRAIGHT_EDGE_TYPE, StraightEdgeWidget } from "./customElements/straightEdge";

export function BasicDiagramView(props: View) {
	const useEventHandlers = createEventHandlerHook(props.activityId);

	const selectDiagramState = useCallback(
		(state: object) => ActivitySelectors.data(props.activityId)(state) as DiagramState,
		[props.activityId]
	);

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<ActivityIdContext.Provider value={{ activityId: props.activityId }}>
				<DropArea>
					<A12DiagramWidget
						activityId={props.activityId}
						selectDiagramState={selectDiagramState}
						nodeWidgetMap={{ [DIAMOND_NODE_TYPE]: DiamondNodeWidget, [STATIC_NODE_TYPE]: StaticNodeWidget }}
						edgeWidgetMap={{ [STRAIGHT_EDGE_TYPE]: StraightEdgeWidget }}
						portWidgetMap={{ [DIAMOND_PORT_TYPE]: DiamondPortWidget }}
						useEventHandlers={useEventHandlers}
						dialogWidgetMap={{ changeEdgeType: ChangeEdgeTypeDialog }}
					/>
					<OperationsBox />
					<ElementEditor />
				</DropArea>
			</ActivityIdContext.Provider>
		</div>
	);
}

function createEventHandlerHook(activityId: string): () => DiagramEventHandlerMap {
	return useEventHandlers;

	function useEventHandlers(): DiagramEventHandlerMap {
		const dispatch = useDispatch();
		const defaultHandlers = useDefaultEventHandlers();

		return {
			onNodeRightMouseDown: (event, nodeId) => {
				dispatch(a12DiagramActions.elementMultiSelected({ activityId, elementId: nodeId }));
				event.currentTarget.addEventListener("contextmenu", e => {
					e.preventDefault();
				});
				defaultHandlers.onNodeRightMouseDown?.(event, nodeId);
			},
			onEdgeRightMouseDown: (event, edgeId) => {
				dispatch(a12DiagramActions.elementMultiSelected({ activityId, elementId: edgeId }));
				event.currentTarget.addEventListener("contextmenu", e => {
					e.preventDefault();
				});
				defaultHandlers.onEdgeRightMouseDown?.(event, edgeId);
			}
		};
	}
}
