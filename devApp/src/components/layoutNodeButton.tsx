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

import { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";

import { a12DiagramActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor";
import type { LayoutAlignment, LayoutDirection, LayoutStrategy } from "@com.mgmtp.a12.diagrameditor/diagrameditor";
import { Button, ButtonGroup, ModalNotification, Select, TextField } from "@com.mgmtp.a12.widgets/widgets-core";

import { useActivityId } from "../examples/activityIdContext";

const layoutDirectionItems: { value: LayoutDirection; label: string }[] = [
	{ value: "LR", label: "LR" },
	{ value: "TB", label: "TB" },
	{ value: "RL", label: "RL" },
	{ value: "BT", label: "BT" }
];

const layoutAlignmentItems: { value: LayoutAlignment; label: string }[] = [
	{ value: "UL", label: "UL" },
	{ value: "UR", label: "UR" },
	{ value: "DL", label: "DL" },
	{ value: "DR", label: "DR" }
];

function isLayoutDirection(value: string): value is LayoutDirection {
	return value === "LR" || value === "TB" || value === "RL" || value === "BT";
}

function isLayoutAlignment(value: string): value is LayoutAlignment {
	return value === "UL" || value === "UR" || value === "DL" || value === "DR";
}

function parseOptionalList<T extends string>(
	input: string,
	validator: (value: string) => value is T
): T[] | undefined | null {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		return undefined;
	}

	const tokens = trimmed.split(",").map(token => token.trim());
	if (tokens.some(token => token.length === 0) || !tokens.every(token => validator(token))) {
		return null;
	}

	return tokens;
}

export function LayoutNodeButton() {
	const dispatch = useDispatch();
	const activityId = useActivityId();
	const [showModal, setShowModal] = useState(false);
	const [globalRankdir, setGlobalRankdir] = useState<LayoutDirection>("LR");
	const [globalAlign, setGlobalAlign] = useState<LayoutAlignment>("DL");
	const [directionsText, setDirectionsText] = useState("");
	const [alignmentsText, setAlignmentsText] = useState("");

	const parsedDirections = parseOptionalList(directionsText, isLayoutDirection);
	const parsedAlignments = parseOptionalList(alignmentsText, isLayoutAlignment);
	const directionsInvalid = parsedDirections === null;
	const alignmentsInvalid = parsedAlignments === null;
	const invalid = directionsInvalid || alignmentsInvalid;

	const layoutStrategy: LayoutStrategy = {
		globalRankdir,
		globalAlign,
		...(parsedDirections ? { directions: parsedDirections } : {}),
		...(parsedAlignments ? { alignments: parsedAlignments } : {})
	};

	return (
		<>
			<Button label="Layout..." onClick={() => setShowModal(true)} />
			{showModal && (
				<ModalNotification
					title="Layout Strategy"
					maxWidth={680}
					enableCloseButton
					onClose={() => setShowModal(false)}
					padding={16}
					footer={
						<ButtonGroup alignment="right">
							<Button label="Cancel" onClick={() => setShowModal(false)} />
							<Button
								label="Apply Layout"
								primary
								disabled={invalid}
								onClick={() => {
									dispatch(a12DiagramActions.diagramLayouted({ activityId, layoutStrategy }));
									setShowModal(false);
								}}
							/>
						</ButtonGroup>
					}
				>
					<LayoutControls>
						<LayoutField>
							<LayoutFieldLabel>Direction (required)</LayoutFieldLabel>
							<Select
								value={globalRankdir}
								items={layoutDirectionItems}
								onValueChanged={value => {
									if (isLayoutDirection(value)) {
										setGlobalRankdir(value);
									}
								}}
							/>
						</LayoutField>
						<LayoutField>
							<LayoutFieldLabel>Alignment (required)</LayoutFieldLabel>
							<Select
								value={globalAlign}
								items={layoutAlignmentItems}
								onValueChanged={value => {
									if (isLayoutAlignment(value)) {
										setGlobalAlign(value);
									}
								}}
							/>
						</LayoutField>
						<LayoutField>
							<LayoutFieldLabel>Directions by depth (optional)</LayoutFieldLabel>
							<TextField
								value={directionsText}
								placeholder="LR,TB,RL"
								onChange={event => setDirectionsText(event.target.value)}
							/>
							{directionsInvalid && <LayoutErrorText>Use only LR, TB, RL, BT.</LayoutErrorText>}
						</LayoutField>
						<LayoutField>
							<LayoutFieldLabel>Alignments by depth (optional)</LayoutFieldLabel>
							<TextField
								value={alignmentsText}
								placeholder="DL,UL,DR"
								onChange={event => setAlignmentsText(event.target.value)}
							/>
							{alignmentsInvalid && <LayoutErrorText>Use only UL, UR, DL, DR.</LayoutErrorText>}
						</LayoutField>
					</LayoutControls>
				</ModalNotification>
			)}
		</>
	);
}

const LayoutControls = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 8px;
	min-width: 420px;
`;

const LayoutField = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 2px;
	min-width: 0;
`;

const LayoutFieldLabel = styled.span`
	font-size: 12px;
	font-weight: 600;
`;

const LayoutErrorText = styled.span`
	font-size: 11px;
	color: #b42318;
`;
