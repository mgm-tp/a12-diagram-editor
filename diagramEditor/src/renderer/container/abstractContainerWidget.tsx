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

import styled from "styled-components";
import { useState } from "react";

import type { DiagramContainer } from "../../core/diagram/container";

import { useElementDragging } from "../common/useElementDragging";
import { useDiagramState } from "../store/stateContext";
import { isLeftMouseKey } from "../utils/inputKeys";
import { ResizePoints } from "../common/resizePoints";
import { AbstractPortWidget } from "../port/abstractPortWidget";
import type { PortWidgetMap } from "../port/portWidgetMap";
import { useOrderIndex } from "../common/useOrderIndex";
import { useCommonEventHandlers } from "../common/commonEventHandlers";

import type { ContainerWidgetMap } from "./containerWidgetMap";
import { useContainerEventHandlers } from "./containerEventHandlers";

interface AbstractContainerWidgetProps {
	id: string;
	containerWidgetMap: ContainerWidgetMap;
	portWidgetMap: PortWidgetMap;
}

export function AbstractContainerWidget(props: AbstractContainerWidgetProps) {
	const { id, containerWidgetMap, portWidgetMap } = props;
	const container = useDiagramState(state => state.diagram.containers[id]);
	const selected = useDiagramState(state => id in state.ui.selectedElements);
	const diagramReadonly = useDiagramState(state => state.ui.readonly);
	const containerReadonly = useDiagramState(state => id in state.ui.readonlyElements);
	const readonly = containerReadonly || diagramReadonly;
	const startDragging = useContainerDragging(id);
	const { onContainerMouseDown, onContainerDoubleClicked } = useContainerEventHandlers();
	const orderIndex = useOrderIndex(id);
	const ContainerWidget = containerWidgetMap[container.customType ?? container.type];
	const [hovered, setHovered] = useState(false);
	const Ports = Object.values(container.ports).map(port => (
		<AbstractPortWidget
			key={port.id}
			parentId={id}
			visible={hovered || selected}
			port={port}
			portWidgetMap={portWidgetMap}
		/>
	));

	return (
		<ContainerWrapper
			id={id}
			data-type="container"
			container={container}
			orderIndex={orderIndex}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onMouseDown={event => {
				if (isLeftMouseKey(event)) {
					event.stopPropagation();
					onContainerMouseDown(event, id);
					startDragging();
				}
			}}
			onDoubleClick={event => onContainerDoubleClicked(event, id)}
		>
			<ContainerWidget container={container} selected={selected} readonly={readonly} />
			{selected && !readonly && <ResizePoints element={container} />}
			{!readonly && Ports}
		</ContainerWrapper>
	);
}

function useContainerDragging(id: string) {
	const startDragging = useElementDragging();
	const multiSelected = useDiagramState(state => Object.keys(state.ui.selectedElements).length > 1);
	const { onMultipleElementsDragged } = useCommonEventHandlers();
	const { onContainerDragged, onContainerDragEnded, onElementsAddedToContainer, onElementsRemovedFromContainer } =
		useContainerEventHandlers();
	const currentContainer = useDiagramState(state =>
		Object.values(state.diagram.containers).find(container => container.children.find(childId => childId === id))
	);

	return () =>
		startDragging({
			elementId: id,
			onDrag: (event, vector) =>
				multiSelected ? onMultipleElementsDragged(event, id, vector) : onContainerDragged(event, id, vector),
			onDragEnd: event => {
				const elements = document.elementsFromPoint(event.clientX, event.clientY);
				const targetContainer = elements.find(el => el.getAttribute("data-type") === "container" && el.id !== id);
				if (targetContainer && targetContainer.id !== currentContainer?.id) {
					if (currentContainer) {
						onElementsRemovedFromContainer(event, [id], currentContainer.id);
					}
					onElementsAddedToContainer(event, [id], targetContainer.id);
				} else if (!targetContainer && currentContainer) {
					onElementsRemovedFromContainer(event, [id], currentContainer.id);
				}
				onContainerDragEnded(event, id);
			}
		});
}

const ContainerWrapper = styled.div.attrs<{ container: DiagramContainer; orderIndex: number }>(props => ({
	style: {
		width: `${props.container.width}px`,
		height: `${props.container.height}px`,
		left: `${props.container.x}px`,
		top: `${props.container.y}px`
	}
}))`
	position: absolute;
	user-select: none;
	pointer-events: all;
	z-index: ${props => props.orderIndex};
`;
