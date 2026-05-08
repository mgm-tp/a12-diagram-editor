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

import { DefaultNodeWidget } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/node/nodeWidget";
import { ContainerWidget } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/renderer/container/containerWidget";
import { createDiagramNode } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/node";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography";
import { HintTooltip } from "@com.mgmtp.a12.widgets/widgets-core";
import { createDiagramContainer } from "@com.mgmtp.a12.diagrameditor/diagrameditor/dist/core/diagram/container";

export function DiagramElementsBox() {
	return (
		<>
			<Typography.Headline
				level={3}
				ariaLevel={3}
				addons={<HintTooltip text="Add elements by dragging them into the diagram" />}
			>
				Add Elements
			</Typography.Headline>
			<Node />
		</>
	);
}

function Node() {
	return (
		<>
			<Typography.Headline level={5} ariaLevel={5}>
				Node
			</Typography.Headline>
			<NodeTemplate
				id="node-template"
				draggable
				onMouseDown={() => document.getSelection()?.empty()}
				onDragStart={e => e.dataTransfer.setData("type", "node")}
			>
				<DefaultNodeWidget
					focussed={false}
					hovered={false}
					readonly={false}
					selected={false}
					node={createDiagramNode({ width: 80, height: 50 })}
				/>
			</NodeTemplate>
			<Typography.Headline level={5} ariaLevel={5}>
				Container
			</Typography.Headline>
			<ContainerTemplate
				draggable
				onMouseDown={() => document.getSelection()?.empty()}
				onDragStart={e => e.dataTransfer.setData("type", "container")}
			>
				<ContainerWidget
					readonly={false}
					selected={false}
					container={createDiagramContainer({ width: 80, height: 50 })}
				/>
			</ContainerTemplate>
		</>
	);
}

const NodeTemplate = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
`;

const ContainerTemplate = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
`;
