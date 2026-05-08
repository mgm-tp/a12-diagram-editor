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


import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import { isNode } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/state";
import { getCanvasDimensions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/utils/htmlHelper";
import { Button, Switch, DefaultFileUpload } from "@com.mgmtp.a12.widgets/widgets-core";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramActions";

import { saveFile } from "../fileAccess/fileSystem";
import { selectDiagramState } from "../examples/store";
import { useActivityId } from "../examples/activityIdContext";

export function OperationsBox() {
	return (
		<OperationsContainer>
			<ToggleGridSwitch />
			<ReadonlySwitch />
			<LayoutNodeButton />
			<MoveToForegroundButton />
			<MoveToBackgroundButton />
			<DeleteButton />
			<CenterNodeButton />
			<CenterCanvasButton />
			<SaveButton />
			<UploadArea />
		</OperationsContainer>
	);
}

export function CenterCanvasButton() {
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const canvasId = useSelector(state => selectDiagramState(activityId)(state).canvasId);
	return (
		<Button
			label="Center Canvas"
			onClick={() =>
				dispatch(a12DiagramActions.canvasCentered({ activityId, canvasDimensions: getCanvasDimensions(canvasId) }))
			}
		/>
	);
}

export function LayoutNodeButton() {
	const dispatch = useDispatch();
	const activityId = useActivityId();
	return <Button label="Layout" onClick={() => dispatch(a12DiagramActions.diagramLayouted({ activityId }))} />;
}

export function DeleteButton() {
	const activityId = useActivityId();
	const dispatch = useDispatch();
	const selectedElementMap = useSelector(state => selectDiagramState(activityId)(state).ui.selectedElements);
	const readonlyElements = useSelector(state => Object.keys(selectDiagramState(activityId)(state).ui.readonlyElements));
	const readonly = useSelector(state => selectDiagramState(activityId)(state).ui.readonly);
	const disabled =
		Object.keys(selectedElementMap).length === 0 || readonlyElements.some(e => selectedElementMap[e]) || readonly;

	return (
		<Button
			label="Delete Selected"
			disabled={disabled}
			onClick={() =>
				dispatch(a12DiagramActions.elementsRemoved({ activityId, elementIds: Object.keys(selectedElementMap) }))
			}
		/>
	);
}

export function CenterNodeButton() {
	const activityId = useActivityId();
	const dispatch = useDispatch();
	const canvasId = useSelector(state => selectDiagramState(activityId)(state).canvasId);
	const selectedElements = useSelector(state => Object.keys(selectDiagramState(activityId)(state).ui.selectedElements));
	const diagram = useSelector(state => selectDiagramState(activityId)(state).diagram);
	const enabled = selectedElements.length === 1 && isNode(selectedElements[0], diagram);

	return (
		<Button
			label="Center Node"
			disabled={!enabled}
			onClick={() => {
				dispatch(
					a12DiagramActions.centerNode({
						activityId,
						nodeId: selectedElements[0],
						canvasDimensions: getCanvasDimensions(canvasId)
					})
				);
			}}
		/>
	);
}

export function ToggleGridSwitch() {
	const activityId = useActivityId();
	const dispatch = useDispatch();
	const showGrid = useSelector(state => selectDiagramState(activityId)(state).ui.showGrid);

	return (
		<StyledSwitch
			label="Grid"
			checked={showGrid}
			onChange={() => {
				dispatch(a12DiagramActions.gridVisibilityToggled({ activityId }));
			}}
		/>
	);
}

export function ReadonlySwitch() {
	const activityId = useActivityId();
	const dispatch = useDispatch();
	const readonly = useSelector(state => selectDiagramState(activityId)(state).ui.readonly);

	return (
		<StyledSwitch
			id="readonly-switch"
			label="Readonly"
			checked={readonly}
			onChange={() => {
				dispatch(a12DiagramActions.readonlyChanged({ activityId, readonly: !readonly }));
			}}
		/>
	);
}

const StyledSwitch = styled(Switch)`
	width: 40px;
`;

export function UploadArea(): React.ReactElement {
	const activityId = useActivityId();
	const dispatch = useDispatch();
	return (
		<DefaultFileUpload
			id="diagram-upload"
			placeholderIcon="none"
			title="Upload diagram from disk"
			accept=".diagram"
			uploadAreaSize={{ width: 85 }}
			onChange={fileList => {
				const files = Array.from(fileList);
				if (files.length === 1) {
					const file = files[0];
					void file.text().then(text => {
						dispatch(a12DiagramActions.diagramLoaded({ activityId, diagram: JSON.parse(text) }));
					});
				}
			}}
		/>
	);
}

export function SaveButton() {
	const activityId = useActivityId();
	const diagram = useSelector(state => selectDiagramState(activityId)(state).diagram);

	return <Button label="Save as" onClick={() => saveFile(diagram)} />;
}

const OperationsContainer = styled.div`
	position: absolute;
	background-color: ${props => props.theme.components.contentBox.contentBoxBG};
	border: 1px solid ${props => props.theme.colors.divider.color};
	.form__screen {
		padding-top: 0 !important;
	}
	left: 20px;
	top: 20px;
	padding: 0;
	height: auto;
	display: flex;
	align-items: center;
	flex-direction: row;
	column-gap: 10px;
	padding: 10px;
`;

export function MoveToForegroundButton() {
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const selectedElements = useSelector(state => Object.keys(selectDiagramState(activityId)(state).ui.selectedElements));
	const disabled = selectedElements.length === 0;

	return (
		<Button
			label="Move to Foreground"
			disabled={disabled}
			onClick={() => {
				selectedElements.forEach(elementId =>
					dispatch(a12DiagramActions.elementMovedToForeground({ activityId, elementId }))
				);
			}}
		/>
	);
}

export function MoveToBackgroundButton() {
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const selectedElements = useSelector(state => Object.keys(selectDiagramState(activityId)(state).ui.selectedElements));
	const disabled = selectedElements.length === 0;

	return (
		<Button
			label="Move to Background"
			disabled={disabled}
			onClick={() => {
				selectedElements.forEach(elementId =>
					dispatch(a12DiagramActions.elementMovedToBackground({ activityId, elementId }))
				);
			}}
		/>
	);
}
