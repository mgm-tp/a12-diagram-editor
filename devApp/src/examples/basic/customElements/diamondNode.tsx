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
import { useState } from "react";

import type { DiagramNode, NodeWidgetProps } from "@com.mgmtp.a12.diagrameditor/diagrameditor";

export const DIAMOND_NODE_TYPE = "diamond-node";

interface DiamondNode extends DiagramNode {
	subLabel: string;
}

function isDiamondNode(node: DiagramNode): node is DiamondNode {
	return node.customType === DIAMOND_NODE_TYPE;
}

export function DiamondNodeWidget(props: NodeWidgetProps) {
	const { node } = props;
	const [showSubLabel, setShowSubLabel] = useState(false);
	if (!isDiamondNode(node)) {
		throw Error("Expected diamond node");
	}

	return (
		<StyledDiamondNode
			{...props}
			onMouseEnter={() => setShowSubLabel(true)}
			onMouseLeave={() => setShowSubLabel(false)}
		>
			<div>{node.label}</div>
			{showSubLabel && (
				<div style={{ position: "absolute", top: "50px", left: "40px", textAlign: "center" }}>{node.subLabel}</div>
			)}
		</StyledDiamondNode>
	);
}

const StyledDiamondNode = styled.div<NodeWidgetProps>`
	border-width: 2px;
	border-style: solid;
	border-color: ${props => {
		if (props.readonly) {
			return "#a9b3bc";
		} else if (props.selected) {
			return "#d50075";
		} else {
			return "#00589f";
		}
	}};
	border-color: ${props => (props.readonly ? "#a9b3bc" : "#00589f")};
	box-shadow: ${props => (props.hovered ? "0 1px 2px 0 rgba(32,46,93,0.4)" : "none")};
	width: 50px;
	height: 50px;
	rotate: 45deg;
	display: flex;
	justify-content: center;
	align-items: center;

	* {
		rotate: -45deg;
		font-size: 1.2em;
		text-align: center;
	}
`;
