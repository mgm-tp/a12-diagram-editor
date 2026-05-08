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



import { assertExists } from "../../core/assertions";
import { DEFAULT_EDGE_LABEL_TYPE, EdgeLabel, EdgeLabelPosition } from "../../core/diagram/edge";

import { useDiagramState } from "../store/stateContext";

import { EdgeLabelWidgetMap } from "./edgeLabelWidgetMap";

interface AbstractEdgeLabelWidgetProps {
	edgeId: string;
	label: EdgeLabel;
	position: EdgeLabelPosition;
	edgeLabelWidgetMap: EdgeLabelWidgetMap;
}

export function AbstractEdgeLabelWidget(props: AbstractEdgeLabelWidgetProps) {
	const type = props.label.customType ?? DEFAULT_EDGE_LABEL_TYPE;
	const EdgeLabelWidget = props.edgeLabelWidgetMap[type];
	assertExists(EdgeLabelWidget, `Missing edge label renderer for type ${type}`);
	const edgeReadonly = useDiagramState(state => props.edgeId in state.ui.readonlyElements);
	const diagramReadonly = useDiagramState(state => state.ui.readonly);
	const readonly = edgeReadonly ?? diagramReadonly;

	return <EdgeLabelWidget {...props} readonly={readonly} />;
}
