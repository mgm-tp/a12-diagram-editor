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

import { Switch, Typography } from "@com.mgmtp.a12.widgets/widgets-core";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor";

import { selectDiagramState } from "../../examples/store";
import { useActivityId } from "../../examples/activityIdContext";
import { useSelector } from "../../hooks";

import { GridContainer } from "./gridContainer";

interface UiStateSectionProps {
	id: string;
}

export function UiStateSection(props: UiStateSectionProps) {
	return (
		<>
			<Typography.Headline level={3} ariaLevel={3} divider>
				UI State
			</Typography.Headline>
			<GridContainer>
				<SelectedSwitch id={props.id} />
				<ReadonlySwitch id={props.id} />
			</GridContainer>
		</>
	);
}

function SelectedSwitch(props: UiStateSectionProps) {
	const { id } = props;
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const selected = useSelector(state => selectDiagramState(activityId)(state).ui.selectedElements[id]);

	return (
		<Switch
			checked={selected}
			label={"Selected"}
			onChange={() => dispatch(a12DiagramActions.elementMultiSelected({ activityId, elementId: id }))}
		/>
	);
}

function ReadonlySwitch(props: UiStateSectionProps) {
	const { id } = props;
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const readonlyElements = useSelector(state => selectDiagramState(activityId)(state).ui.readonlyElements);
	const readonly = readonlyElements[id] ?? false;

	return (
		<Switch
			checked={readonly}
			label={"Readonly"}
			onChange={() => {
				const action = readonly ? a12DiagramActions.elementSetToNotReadonly : a12DiagramActions.elementSetToReadonly;
				dispatch(action({ activityId, elementId: id }));
			}}
		/>
	);
}
