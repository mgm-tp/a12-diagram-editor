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



import { Dispatch } from "@reduxjs/toolkit";
import { ReactNode, useMemo } from "react";

import { AuxiliaryLinesLayer } from "./auxiliaryLines/auxiliaryLinesLayer";
import { TransformationLayer } from "./common/transformationLayer";
import { AbstractDialogWidget } from "./dialog/abstractDialogWidget";
import { defaultDialogWidgetMap, DialogWidgetMap } from "./dialog/dialogWidgetMap";
import { EdgeLayer } from "./edge/edgeLayer";
import { defaultEdgeWidgetMap, EdgeWidgetMap } from "./edge/edgeWidgetMap";
import { GridLayer } from "./grid/gridLayer";
import { NodeLayer } from "./node/nodeLayer";
import { defaultNodeWidgetMap, NodeWidgetMap } from "./node/nodeWidgetMap";
import { defaultPortWidgetMap, PortWidgetMap } from "./port/portWidgetMap";
import { DiagramEventHandlerContext, DiagramEventHandlerMap } from "./store/configuration/eventHandlers";
import { DiagramStateContext, DiagramStateSelector } from "./store/stateContext";
import { CanvasWidget } from "./canvas/canvasWidget";
import { ContainerLayer } from "./container/containerLayer";
import { defaultEdgeLabelWidgetMap, EdgeLabelWidgetMap } from "./edge/edgeLabelWidgetMap";
import { ContainerWidgetMap, defaultContainerWidgetMap } from "./container/containerWidgetMap";

export interface DiagramWidgetProps {
	selectDiagramState: DiagramStateSelector;
	nodeWidgetMap?: NodeWidgetMap;
	containerWidgetMap?: ContainerWidgetMap;
	edgeWidgetMap?: EdgeWidgetMap;
	portWidgetMap?: PortWidgetMap;
	dialogWidgetMap?: DialogWidgetMap;
	edgeLabelWidgetMap?: EdgeLabelWidgetMap;
	useEventHandlers?: () => DiagramEventHandlerMap;
	children?: ReactNode;
	customDispatch?: Dispatch;
}

export function DiagramWidget(props: DiagramWidgetProps) {
	const { selectDiagramState, customDispatch, children } = props;
	const {
		nodeWidgetMap = {},
		containerWidgetMap = {},
		edgeWidgetMap = {},
		portWidgetMap = {},
		dialogWidgetMap = {},
		edgeLabelWidgetMap = {}
	} = props;
	const mergedNodeWidgetMap: NodeWidgetMap = { ...defaultNodeWidgetMap, ...nodeWidgetMap };
	const mergedContainerWidgetMap: ContainerWidgetMap = { ...defaultContainerWidgetMap, ...containerWidgetMap };
	const mergedEdgeWidgetMap: EdgeWidgetMap = { ...defaultEdgeWidgetMap, ...edgeWidgetMap };
	const mergedPortWidgetMap: PortWidgetMap = { ...defaultPortWidgetMap, ...portWidgetMap };
	const mergedDialogWidgetMap: DialogWidgetMap = { ...defaultDialogWidgetMap, ...dialogWidgetMap };
	const mergedEdgeLabelWidgetMap: EdgeLabelWidgetMap = { ...defaultEdgeLabelWidgetMap, ...edgeLabelWidgetMap };

	const diagramStateContext = useMemo(
		() => ({ selectDiagramState, customDispatch }),
		[selectDiagramState, customDispatch]
	);

	return (
		<DiagramStateContext.Provider value={diagramStateContext}>
			<DiagramEventHandlerContext.Provider value={props.useEventHandlers}>
				<CanvasWidget>
					<TransformationLayer>
						<GridLayer />
						<ContainerLayer containerWidgetMap={mergedContainerWidgetMap} portWidgetMap={mergedPortWidgetMap} />
						<AuxiliaryLinesLayer />
						<EdgeLayer edgeWidgetMap={mergedEdgeWidgetMap} edgeLabelWidgetMap={mergedEdgeLabelWidgetMap} />
						<NodeLayer nodeWidgetMap={mergedNodeWidgetMap} portWidgetMap={mergedPortWidgetMap} />
						{children}
					</TransformationLayer>
				</CanvasWidget>
				<AbstractDialogWidget dialogWidgetMap={mergedDialogWidgetMap} />
			</DiagramEventHandlerContext.Provider>
		</DiagramStateContext.Provider>
	);
}
