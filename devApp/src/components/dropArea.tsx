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

import { useDispatch } from "react-redux";
import styled from "styled-components";

import {
	createDiagramNode,
	getDiagramPosition,
	getCanvasPosition,
	a12DiagramActions,
	createDiagramContainer
} from "@com.mgmtp.a12.diagrameditor/diagrameditor";

import { selectDiagramState } from "../examples/store";
import { useActivityId } from "../examples/activityIdContext";
import { useSelector } from "../hooks";

interface DropAreaProps {
	children: React.ReactNode;
}

export function DropArea(props: DropAreaProps): React.ReactElement {
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const canvasId = useSelector(state => selectDiagramState(activityId)(state).canvasId);
	const offset = useSelector(state => selectDiagramState(activityId)(state).ui.offset);
	const zoomLevel = useSelector(state => selectDiagramState(activityId)(state).ui.zoomLevel);
	const stepSize = useSelector(state => selectDiagramState(activityId)(state).ui.gridStepSize);

	return (
		<StyledDropArea
			id="drop-area"
			onDragOver={e => e.preventDefault()}
			onDrop={e => {
				const type = e.dataTransfer.getData("type");
				const canvasPosition = getCanvasPosition(canvasId);
				const position = getDiagramPosition(
					canvasPosition,
					{ x: e.clientX, y: e.clientY },
					offset,
					zoomLevel,
					stepSize
				);
				let addedElementId = "";
				const portDistribution = { bottom: 3, left: 2, right: 2, top: 3 };
				if (type === "node") {
					const node = createDiagramNode({ label: "New Node" }, portDistribution);
					const positionedNode = { ...node, x: position.x - node.width / 2, y: position.y - node.height / 2 };
					dispatch(a12DiagramActions.nodeAdded({ activityId, node: positionedNode }));
					addedElementId = positionedNode.id;
				} else if (type === "container") {
					const container = createDiagramContainer({ label: "New Container" }, portDistribution);
					const positionedContainer = {
						...container,
						x: position.x - container.width / 2,
						y: position.y - container.height / 2
					};
					dispatch(a12DiagramActions.containerAdded({ activityId, container: positionedContainer }));
					addedElementId = positionedContainer.id;
				}
				const elements = document.elementsFromPoint(e.clientX, e.clientY);
				const targetContainer = elements.find(
					el => el.getAttribute("data-type") === "container" && el.id !== addedElementId
				);
				if (targetContainer) {
					const elementIds = [addedElementId];
					const containerId = targetContainer.id;
					dispatch(a12DiagramActions.elementsAddedToContainer({ activityId, elementIds, containerId }));
				}
			}}
		>
			{props.children}
		</StyledDropArea>
	);
}

const StyledDropArea = styled.div`
	height: 100%;
`;
