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

import { TextOutput } from "@com.mgmtp.a12.widgets/widgets-core/lib/text-output";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox";
import {
	DiagramEdge,
	EdgeLabel,
	EdgeLabelPosition
} from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/edge";
import { TextField } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-field";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramActions";

import { selectDiagramState } from "../../examples/store";
import { useActivityId } from "../../examples/activityIdContext";

import { UiStateSection } from "./uiStateSection";
import { GridContainer } from "./gridContainer";

export interface EdgeEditorProps {
	id: string;
}

export function EdgeEditor(props: EdgeEditorProps) {
	const { id } = props;
	const activityId = useActivityId();
	const edge = useSelector(state => selectDiagramState(activityId)(state).diagram.edges[id]);
	if (!edge) {
		return null;
	}

	return (
		<ActionContentbox
			id={"edge-properties-editor"}
			headingElements={<ContentBoxElements.Title ariaLevel={2} text="Edge Properties" />}
		>
			<GeneralInformation edge={edge} />
			<LabelsSection edge={edge} />
			<UiStateSection id={props.id} />
		</ActionContentbox>
	);
}

interface EdgeProps {
	edge: DiagramEdge;
}

function GeneralInformation(props: EdgeProps) {
	const { edge } = props;
	const sourcePosition = edge.anchors[0];
	const targetPosition = edge.anchors[edge.anchors.length - 1];

	return (
		<>
			<Typography.Headline level={3} ariaLevel={3} divider>
				General information
			</Typography.Headline>
			<TextOutput label="ID" style={{ marginBottom: "10px" }}>
				{edge.id}
			</TextOutput>
			<GridContainer>
				<TextOutput label="Source Position">{`x: ${sourcePosition.x}, y: ${sourcePosition.y}`}</TextOutput>
				<TextOutput label="Target Position">{`x: ${targetPosition.x}, y: ${targetPosition.y}`}</TextOutput>
			</GridContainer>
		</>
	);
}

function LabelsSection(props: EdgeProps) {
	const { id, labels } = props.edge;

	return (
		<>
			<Typography.Headline level={3} ariaLevel={3} divider>
				Labels
			</Typography.Headline>
			<LabelInputs title="Middle Label" position="middle" edgeId={id} label={labels?.middle} />
			<LabelInputs title="First Start Label" position="start-first" edgeId={id} label={labels?.start?.first} />
			<LabelInputs title="Second Start Label" position="start-second" edgeId={id} label={labels?.start?.second} />
			<LabelInputs title="First End Label" position="end-first" edgeId={id} label={labels?.end?.first} />
			<LabelInputs title="Second End Label" position="end-second" edgeId={id} label={labels?.end?.second} />
		</>
	);
}

interface LabelInputsProps {
	edgeId: string;
	title: string;
	label?: EdgeLabel;
	position: EdgeLabelPosition;
}

function LabelInputs(props: LabelInputsProps) {
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const { label, edgeId, position, title } = props;

	return (
		<>
			<Typography.Headline level={4} ariaLevel={4}>
				{title}
			</Typography.Headline>
			<GridContainer>
				<TextField
					label="Text"
					value={label?.text}
					onChange={e =>
						dispatch(
							a12DiagramActions.edgeUpdated({ activityId, edgeId, updates: resolveUpdate(position, e.target.value) })
						)
					}
				/>
				<TextField
					label="Subtext"
					value={label?.subText}
					onChange={e =>
						dispatch(
							a12DiagramActions.edgeUpdated({
								activityId,
								edgeId,
								updates: resolveUpdate(position, undefined, e.target.value)
							})
						)
					}
				/>
			</GridContainer>
		</>
	);
}

function resolveUpdate(position: EdgeLabelPosition, text?: string, subText?: string): Partial<DiagramEdge> {
	switch (position) {
		case "start-first":
			return { labels: { start: { first: { text, subText } } } };
		case "start-second":
			return { labels: { start: { second: { text, subText } } } };
		case "end-first":
			return { labels: { end: { first: { text, subText } } } };
		case "end-second":
			return { labels: { end: { second: { text, subText } } } };
		case "middle":
			return { labels: { middle: { text, subText } } };
	}
}
