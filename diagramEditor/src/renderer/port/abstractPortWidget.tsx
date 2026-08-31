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

import { memo, useState } from "react";
import styled from "styled-components";

import type { DiagramPort } from "../../core/diagram/port";
import { isReadonly } from "../../core/state";

import { useDiagramState } from "../store/stateContext";
import { isLeftMouseKey } from "../utils/inputKeys";
import { useCanvasContext } from "../canvas/canvasContext";
import { selectConnectedEdgeByPortId, selectUnconnectedEdgeId } from "../edge/edgeSelectors";

import type { PortWidgetMap } from "./portWidgetMap";
import { usePortEventHandlers } from "./portEventHandlers";

interface AbstractNodeWidgetProps {
	port: DiagramPort;
	parentId: string;
	visible: boolean;
	portWidgetMap: PortWidgetMap;
}

export const AbstractPortWidget = memo(AbstractPortWidgetInternal);

function AbstractPortWidgetInternal(props: AbstractNodeWidgetProps) {
	const { port, parentId, visible, portWidgetMap } = props;
	const type = port.customType ?? port.type;
	const Widget = portWidgetMap[type];
	const parent = useDiagramState(state => state.diagram.nodes[parentId] ?? state.diagram.containers[parentId]);
	const readonly = useDiagramState(state => isReadonly(parentId, state.ui.readonlyElements) || state.ui.readonly);
	const [hovered, setHovered] = useState(false);
	const unconnectedEdgeId = useDiagramState(selectUnconnectedEdgeId);
	const connectedEdge = useDiagramState(selectConnectedEdgeByPortId(port.id));
	const canvasContext = useCanvasContext();
	const { onConnectedPortMouseDown, onUnconnectedPortMouseDown, onEdgeConnectedToPort } = usePortEventHandlers();

	return (
		<PortWrapper
			{...props}
			hovered={hovered}
			id={port.id}
			data-type={type}
			visible={visible}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onMouseDown={event => {
				event.stopPropagation();
				if (!isLeftMouseKey(event)) {
					return;
				}
				if (connectedEdge) {
					onConnectedPortMouseDown(event, port.id, connectedEdge);
				} else {
					onUnconnectedPortMouseDown(event, port.id, parent);
				}
			}}
			onMouseUp={event => {
				if (isLeftMouseKey(event) && unconnectedEdgeId) {
					event.stopPropagation();
					onEdgeConnectedToPort(event, port.id, unconnectedEdgeId);
					canvasContext.clear();
				}
			}}
		>
			<Widget port={port} hovered={hovered} visible={visible} readonly={readonly} />
		</PortWrapper>
	);
}

const ADDITIONAL_HOVER_AREA_SINGLE_SIDE_LENGTH = 5;

const PortWrapper = styled.div.attrs<AbstractNodeWidgetProps & { hovered: boolean }>(props => ({
	style: {
		width: `${props.port.width + 2 * ADDITIONAL_HOVER_AREA_SINGLE_SIDE_LENGTH}px`,
		height: `${props.port.height + 2 * ADDITIONAL_HOVER_AREA_SINGLE_SIDE_LENGTH}px`,
		top: `${props.port.offset.top - props.port.height / 2 - ADDITIONAL_HOVER_AREA_SINGLE_SIDE_LENGTH}px`,
		left: `${props.port.offset.left - props.port.width / 2 - ADDITIONAL_HOVER_AREA_SINGLE_SIDE_LENGTH}px`
	}
}))`
	position: absolute;
	padding: ${ADDITIONAL_HOVER_AREA_SINGLE_SIDE_LENGTH}px;
	* {
		background-color: ${props => (props.visible ? "" : "transparent")};
	}
`;
