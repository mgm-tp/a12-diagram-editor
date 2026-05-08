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
import styled from "styled-components";

import { isContainer, isEdge, isNode } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/state";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button";
import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/a12Client/a12DiagramActions";

import { selectDiagramState } from "../../examples/store";
import { useActivityId } from "../../examples/activityIdContext";

import { NodeEditor } from "./nodeEditor";
import { EdgeEditor } from "./edgeEditor";
import { ContainerEditor } from "./containerEditor";

export function ElementEditor(): React.ReactElement | null {
	const activityId = useActivityId();
	const selectedElements = useSelector(state => selectDiagramState(activityId)(state).ui.selectedElements);
	const diagram = useSelector(state => selectDiagramState(activityId)(state).diagram);
	const id = Object.keys(selectedElements)[0];

	if (Object.keys(selectedElements).length !== 1) {
		return null;
	}

	return (
		<ElementEditorContainer>
			{isNode(id, diagram) && <NodeEditor id={id} />}
			{isEdge(id, diagram) && <EdgeEditor id={id} />}
			{isContainer(id, diagram) && <ContainerEditor id={id} />}
			<CloseButton />
		</ElementEditorContainer>
	);
}

const ElementEditorContainer = styled.div`
	position: absolute;
	background-color: ${props => props.theme.components.contentBox.contentBoxBG};
	padding: ${props => `0 ${props.theme.components.contentBox.contentBoxHorizontalPadding}`};
	border: 1px solid ${props => props.theme.colors.divider.color};
	right: 0px;
	top: 0px;
	width: 300px;
	height: 100%;
	padding-top: 20px;
	div[data-role="switch"] {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
`;

function CloseButton(): React.ReactElement {
	const activityId = useActivityId();
	const dispatch = useDispatch();
	return (
		<StyledButton
			title={"Close"}
			secondary
			icon={<Icon>close</Icon>}
			onClick={() => {
				dispatch(a12DiagramActions.canvasSelected({ activityId }));
			}}
		/>
	);
}

const StyledButton = styled(Button)`
	position: absolute;
	top: 15px;
	right: 15px;
`;
