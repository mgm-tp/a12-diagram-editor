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

import { useContext, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import { HintTooltip, Select } from "@com.mgmtp.a12.widgets/widgets-core";
import { ActivityActions, ActivityMap, ActivitySelectors } from "@com.mgmtp.a12.client/client-core/lib/core/activity";
import { FrameViews } from "@com.mgmtp.a12.client/client-core";

import { DiagramElementsBox } from "./elementsBox";

export function SideBarView() {
	const context = useContext(FrameViews.SidebarContext);
	return context?.subExpanded ? <SideBar /> : null;
}

function SideBar() {
	const [selectedDiagram, setSelectedDiagram] = useState("basic");
	const activityMap = useSelector(ActivitySelectors.activities());
	const dispatch = useDispatch();
	const items = [
		{
			label: "Basic",
			value: "basic",
			description: `This example demonstrates basic customizations. It includes custom elements, of which the static ones cannot be modified.
			Furthermore it showcases how certain events can be extended to request a confirmation from the user and how to enforce a specific edge type on a node`
		},
		{ label: "Empty", value: "empty", description: "This example contains a diagram without any customizations" },
		{
			label: "Performance",
			value: "performance",
			description: `This example contains a large diagram to demonstrate the performance of the diagram editor.
			It includes 32 rows and 32 columns, resulting in 1024 nodes and 1023 edges.`
		}
	];
	return (
		<StyledSideBar>
			<Select
				label="Examples"
				value={selectedDiagram}
				items={items}
				onValueChanged={value => {
					const activity = ActivityMap.toList(activityMap).find(a => a.descriptor.diagram !== undefined)!;
					dispatch(ActivityActions.cancel({ activityId: activity.id }));
					dispatch(ActivityActions.create({ activityDescriptor: { diagram: value } }));
					setSelectedDiagram(value);
				}}
				tooltips={<HintTooltip text={items.find(item => item.value === selectedDiagram)?.description} />}
			/>
			<DiagramElementsBox />
		</StyledSideBar>
	);
}

const StyledSideBar = styled.div`
	padding: 20px;
`;
