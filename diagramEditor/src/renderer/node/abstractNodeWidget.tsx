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

import { assertExists } from "../../core/assertions";

import { AbstractPortWidget } from "../port/abstractPortWidget";
import { PortWidgetMap } from "../port/portWidgetMap";
import { useDiagramState } from "../store/stateContext";
import { isRightMouseKey, isLeftMouseKey } from "../utils/inputKeys";
import { useOrderIndex } from "../common/useOrderIndex";

import { NodeWidgetMap } from "./nodeWidgetMap";
import { useNodeEventHandlers } from "./nodeEventHandlers";

interface AbstractNodeWidgetProps {
	id: string;
	nodeWidgetMap: NodeWidgetMap;
	portWidgetMap: PortWidgetMap;
}

export const AbstractNodeWidget = memo(AbstractNodeWidgetInternal);

function AbstractNodeWidgetInternal(props: AbstractNodeWidgetProps) {
	const { id, nodeWidgetMap, portWidgetMap } = props;
	const { focussed, hovered, node, readonly, selected, setFocussed, setHovered } = useNodeState(id);
	const orderIndex = useOrderIndex(id);
	const { onNodeMouseDown, onNodeDoubleClicked, onNodeRightMouseDown } = useNodeEventHandlers();
	const NodeWidget = nodeWidgetMap[node.customType ?? node.type];
	const currentContainerId = useDiagramState(
		state =>
			Object.values(state.diagram.containers).find(container => container.children.find(childId => childId === id))?.id
	);

	assertExists(NodeWidget, `Missing renderer for type ${node.type}`);
	const Ports =
		hovered || focussed
			? Object.values(node.ports).map(port => (
					<AbstractPortWidget
						key={port.id}
						parentId={id}
						visible={hovered || focussed}
						port={port}
						portWidgetMap={portWidgetMap}
					/>
				))
			: [];

	return (
		<NodeWrapper
			id={id}
			// We have to use inline styles here because styled components displays a warning that the style changes too often. There is also a noticable performance boost.
			style={{ top: node.y, left: node.x, width: node.width, height: node.height }}
			selected={selected}
			orderIndex={orderIndex}
			data-type={node.type}
			data-customtype={node.customType}
			onFocus={() => setFocussed(true)}
			onBlur={() => setFocussed(false)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onMouseDown={event => {
				if (isLeftMouseKey(event)) {
					event.stopPropagation();
					onNodeMouseDown(event, id, currentContainerId);
				} else if (isRightMouseKey(event)) {
					onNodeRightMouseDown(event, id);
				}
			}}
			onDoubleClick={event => onNodeDoubleClicked(event, id)}
		>
			<NodeWidget node={node} readonly={readonly} focussed={focussed} hovered={hovered} selected={selected} />
			{!readonly && Ports}
		</NodeWrapper>
	);
}

function useNodeState(id: string) {
	const node = useDiagramState(state => state.diagram.nodes[id]);
	const [focussed, setFocussed] = useState(false);
	const [hovered, setHovered] = useState(false);
	const nodeReadonly = useDiagramState(state => id in state.ui.readonlyElements);
	const diagramReadonly = useDiagramState(state => state.ui.readonly);
	const selected = useDiagramState(state => id in state.ui.selectedElements);

	return { node, focussed, hovered, readonly: nodeReadonly || diagramReadonly, selected, setFocussed, setHovered };
}

const NodeWrapper = styled.div<{ selected: boolean; orderIndex: number }>`
	position: absolute;
	user-select: none;
	pointer-events: all;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: ${props => props.orderIndex};
`;
