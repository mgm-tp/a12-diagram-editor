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


import { MouseEvent } from "react";

import { Vector } from "../../core/geometry";

import { useElementDragging } from "../common/useElementDragging";
import { diagramActions } from "../store/slice";
import { useDiagramDispatch, useDiagramState } from "../store/stateContext";
import { multiSelectKeyPressed } from "../utils/inputKeys";
import { useCustomEventHandlers } from "../store/configuration/eventHandlers";

export interface EdgeEventHandlers {
	onEdgeMouseDown: (event: MouseEvent, edgeId: string) => void;
	onEdgeSegmentMouseDown: (event: MouseEvent, edgeId: string, anchorId: string) => void;
	onEdgeAnchorMouseDown: (event: MouseEvent, edgeId: string, anchorId: string) => void;
	onEdgeDoubleClicked: (event: MouseEvent, edgeId: string) => void;
	onEdgeRightMouseDown: (event: MouseEvent, edgeId: string) => void;
	onEdgeSegmentDragged: (event: MouseEvent, edgeId: string, anchorId: string, vector: Vector) => void;
	onEdgeSegmentDragEnded: (event: MouseEvent, edgeId: string, anchorId: string) => void;
	onEdgeEndDragged: (event: MouseEvent, edgeId: string, anchorId: string, vector: Vector) => void;
	onEdgeEndDragEnded: (event: MouseEvent, edgeId: string, anchorId: string) => void;
	onEdgeAnchorDragged: (event: MouseEvent, edgeId: string, anchorId: string, vector: Vector) => void;
	onEdgeAnchorDragEnded: (event: MouseEvent, edgeId: string, anchorId: string) => void;
}

export function useEdgeEventHandlers(): EdgeEventHandlers {
	const eventHandlers = useDefaultEdgeEventHandlers();
	const customEventHandlers = useCustomEventHandlers();
	return { ...eventHandlers, ...customEventHandlers };
}

export function useDefaultEdgeEventHandlers(): EdgeEventHandlers {
	const enabledEventHandlers = useEnabledEventHandlers();
	const readonlyEventHandlers = useReadonlyEventHandlers();
	const readonly = useDiagramState(state => state.ui.readonly);
	return readonly ? readonlyEventHandlers : enabledEventHandlers;
}

function useEnabledEventHandlers(): EdgeEventHandlers {
	const dispatch = useDiagramDispatch();
	const startDragging = useElementDragging();

	const onEdgeSegmentDragged: EdgeEventHandlers["onEdgeSegmentDragged"] = (event, edgeId, anchorId, vector) =>
		dispatch(diagramActions.singleSegmentMoved({ parentEdgeId: edgeId, anchorId, vector }));
	const onEdgeSegmentDragEnded: EdgeEventHandlers["onEdgeSegmentDragEnded"] = (event, edgeId, anchorId) =>
		dispatch(diagramActions.dragEnded());
	const onEdgeAnchorDragged: EdgeEventHandlers["onEdgeAnchorDragged"] = (event, edgeId, anchorId, vector) =>
		dispatch(diagramActions.edgeAnchorMoved({ parentEdgeId: edgeId, anchorId, vector }));
	const onEdgeAnchorDragEnded: EdgeEventHandlers["onEdgeAnchorDragEnded"] = (event, edgeId, anchorId) =>
		dispatch(diagramActions.edgeAnchorMovedEnded({ parentEdgeId: edgeId, anchorId }));

	return {
		onEdgeDoubleClicked: () => {},
		onEdgeRightMouseDown: () => {},
		onEdgeMouseDown: (event, edgeId) => {
			if (multiSelectKeyPressed(event)) {
				dispatch(diagramActions.elementMultiSelected({ elementId: edgeId }));
			} else {
				dispatch(diagramActions.elementSelected({ elementId: edgeId }));
			}
		},
		onEdgeSegmentMouseDown: (event, edgeId, anchorId) => {
			startDragging({
				elementId: anchorId,
				onDrag: (event, vector) => onEdgeSegmentDragged(event, edgeId, anchorId, vector),
				onDragEnd: event => onEdgeSegmentDragEnded(event, edgeId, anchorId)
			});
		},
		onEdgeSegmentDragged,
		onEdgeSegmentDragEnded,
		onEdgeEndDragged: (_event, edgeId, anchorId, vector) =>
			dispatch(diagramActions.edgeEndMoved({ edgeId, anchorId, vector })),
		onEdgeEndDragEnded: () => dispatch(diagramActions.connectEdgeCancelled()),
		onEdgeAnchorMouseDown: (_event, edgeId, anchorId) => {
			startDragging({
				elementId: anchorId,
				onDrag: (event, vector) => onEdgeAnchorDragged(event, edgeId, anchorId, vector),
				onDragEnd: event => onEdgeAnchorDragEnded(event, edgeId, anchorId)
			});
		},
		onEdgeAnchorDragged,
		onEdgeAnchorDragEnded
	};
}

function useReadonlyEventHandlers(): EdgeEventHandlers {
	const dispatch = useDiagramDispatch();

	return {
		onEdgeMouseDown: (event, edgeId) => {
			if (multiSelectKeyPressed(event)) {
				dispatch(diagramActions.elementMultiSelected({ elementId: edgeId }));
			} else {
				dispatch(diagramActions.elementSelected({ elementId: edgeId }));
			}
		},
		onEdgeDoubleClicked: () => {},
		onEdgeRightMouseDown: () => {},
		onEdgeSegmentMouseDown: () => {},
		onEdgeAnchorMouseDown: () => {},
		onEdgeSegmentDragged: () => {},
		onEdgeSegmentDragEnded: () => {},
		onEdgeEndDragged: () => {},
		onEdgeEndDragEnded: () => {},
		onEdgeAnchorDragged: () => {},
		onEdgeAnchorDragEnded: () => {}
	};
}
