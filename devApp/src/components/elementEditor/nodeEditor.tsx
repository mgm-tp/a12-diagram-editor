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



import { useDispatch, useSelector } from "react-redux";

import { ActionContentbox, ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox";
import { TextField } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-field";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography";
import { TextOutput } from "@com.mgmtp.a12.widgets/widgets-core/lib/text-output";
import { DiagramNode } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/node";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramActions";

import { selectDiagramState } from "../../examples/store";
import { useActivityId } from "../../examples/activityIdContext";

import { GridContainer } from "./gridContainer";
import { UiStateSection } from "./uiStateSection";

interface NodeEditorProps {
	id: string;
}

export function NodeEditor(props: NodeEditorProps) {
	const { id } = props;
	const activityId = useActivityId();
	const node = useSelector(state => selectDiagramState(activityId)(state).diagram.nodes[id]);

	return (
		<ActionContentbox headingElements={<ContentBoxElements.Title ariaLevel={2} key="title" text="Node Properties" />}>
			<GeneralInformation node={node} />
			<Label node={node} />
			<UiStateSection id={id} />
		</ActionContentbox>
	);
}

interface NodeProps {
	node: DiagramNode;
}

function GeneralInformation(props: NodeProps) {
	const { node } = props;

	return (
		<>
			<Typography.Headline level={3} ariaLevel={3} divider>
				General information
			</Typography.Headline>

			<GridContainer>
				<TextOutput label="ID">{node.id}</TextOutput>
				<TextOutput label="Position">{`x: ${node.x}, y: ${node.y}`}</TextOutput>
			</GridContainer>
		</>
	);
}

function Label(props: NodeProps) {
	const { node } = props;
	const dispatch = useDispatch();
	const activityId = useActivityId();

	return (
		<>
			<Typography.Headline level={3} ariaLevel={3} divider>
				Label
			</Typography.Headline>
			<TextField
				value={node.label}
				placeholder="Enter Node Label"
				onChange={event =>
					dispatch(
						a12DiagramActions.nodeUpdated({ activityId, nodeId: node.id, updates: { label: event.target.value } })
					)
				}
			/>
		</>
	);
}
