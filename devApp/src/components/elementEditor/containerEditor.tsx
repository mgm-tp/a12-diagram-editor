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

import {
	ActionContentbox,
	ContentBoxElements,
	TextField,
	Typography,
	TextOutput
} from "@com.mgmtp.a12.widgets/widgets-core";
import type { DiagramContainer } from "@com.mgmtp.a12.diagrameditor/diagrameditor";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor";

import { selectDiagramState } from "../../examples/store";
import { useActivityId } from "../../examples/activityIdContext";
import { useSelector } from "../../hooks";

import { GridContainer } from "./gridContainer";
import { UiStateSection } from "./uiStateSection";

interface ContainerEditorProps {
	id: string;
}

export function ContainerEditor(props: ContainerEditorProps) {
	const { id } = props;
	const activityId = useActivityId();
	const container = useSelector(state => selectDiagramState(activityId)(state).diagram.containers[id]);

	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title ariaLevel={2} key="title" text="Container Properties" />}
		>
			<GeneralInformation container={container} />
			<Label container={container} />
			<UiStateSection id={id} />
		</ActionContentbox>
	);
}

interface ContainerProps {
	container: DiagramContainer;
}

function GeneralInformation(props: ContainerProps) {
	const { container } = props;

	return (
		<>
			<Typography.Headline level={3} ariaLevel={3} divider>
				General information
			</Typography.Headline>

			<GridContainer>
				<TextOutput label="ID">{container.id}</TextOutput>
				<TextOutput label="Position">{`x: ${container.x}, y: ${container.y}`}</TextOutput>
			</GridContainer>
		</>
	);
}

function Label(props: ContainerProps) {
	const { container } = props;
	const dispatch = useDispatch();
	const activityId = useActivityId();

	return (
		<>
			<Typography.Headline level={3} ariaLevel={3} divider>
				Label
			</Typography.Headline>
			<TextField
				value={container.label}
				placeholder="Enter Node Label"
				onChange={event =>
					dispatch(
						a12DiagramActions.containerUpdated({
							activityId,
							containerId: container.id,
							updates: { label: event.target.value }
						})
					)
				}
			/>
		</>
	);
}
