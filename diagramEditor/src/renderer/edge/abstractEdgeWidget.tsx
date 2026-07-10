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

import { memo } from "react";
import styled from "styled-components";

import { useDiagramState } from "../store/stateContext";
import { isLeftMouseKey, isRightMouseKey } from "../utils/inputKeys";
import { useOrderIndex } from "../common/useOrderIndex";

import type { EdgeWidgetMap } from "./edgeWidgetMap";
import { EdgeLabelsWidget } from "./edgeLabelsWidget";
import type { EdgeLabelWidgetMap } from "./edgeLabelWidgetMap";
import { useEdgeEventHandlers } from "./edgeEventHandlers";

interface RightAngleEdgeProps {
	id: string;
	edgeWidgetMap: EdgeWidgetMap;
	edgeLabelWidgetMap: EdgeLabelWidgetMap;
}

export const AbstractEdgeWidget = memo(AbstractEdgeWidgetInternal);

export function AbstractEdgeWidgetInternal(props: RightAngleEdgeProps) {
	const { id, edgeWidgetMap, edgeLabelWidgetMap } = props;
	const edge = useDiagramState(state => state.diagram.edges[id]);
	const edgeReadonly = useDiagramState(state => id in state.ui.readonlyElements);
	const diagramReadonly = useDiagramState(state => state.ui.readonly);
	const readonly = edgeReadonly || diagramReadonly;
	const orderIndex = useOrderIndex(id);
	const selected = useDiagramState(state => id in state.ui.selectedElements);
	const type = edge.customType ?? edge.type;
	const Widget = edgeWidgetMap[type];
	const { onEdgeMouseDown, onEdgeRightMouseDown, onEdgeDoubleClicked } = useEdgeEventHandlers();

	return (
		<EdgeWrapper
			id={id}
			selected={selected}
			orderIndex={orderIndex}
			data-type={edge.type}
			data-customtype={edge.customType}
			onDoubleClick={event => onEdgeDoubleClicked(event, id)}
			onMouseDown={event => {
				if (isLeftMouseKey(event)) {
					event.stopPropagation();
					onEdgeMouseDown(event, id);
				} else if (isRightMouseKey(event)) {
					onEdgeRightMouseDown(event, id);
				}
			}}
		>
			<Widget edge={edge} selected={selected} readonly={readonly} />
			<EdgeLabelsWidget edge={edge} edgeLabelWidgetMap={edgeLabelWidgetMap} />
		</EdgeWrapper>
	);
}

const EdgeWrapper = styled.div<{ selected: boolean; orderIndex: number }>`
	position: absolute;
	overflow: visible;
	z-index: ${props => props.orderIndex};
`;
