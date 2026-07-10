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

import { merge } from "lodash/fp";

import type { DiagramState, UIState } from "../../src/core/state";
import type { Diagram } from "../../src/core/diagram/diagram";
import type { DiagramNode } from "../../src/core/diagram/node";
import type { ConnectedDiagramEdge, UnconnectedDiagramEdge } from "../../src/core/diagram/edge";
import type { DiagramPort } from "../../src/core/diagram/port";
import type { DeepPartial } from "../../src/core/types";

const defaultUiState: UIState = {
	zoomLevel: 100,
	offset: { left: 0, top: 0 },
	readonlyElements: {},
	selectedElements: {},
	showGrid: true,
	gridStepSize: 1,
	readonly: false,
	backgroundElements: [],
	foregroundElements: [],
	isDragging: false
};

const defaultDiagram: Diagram = { nodes: {}, edges: {}, containers: {} };

export function createDiagramState(state?: DeepPartial<DiagramState>): DiagramState {
	return {
		canvasId: `canvas-1`,
		diagram: merge(defaultDiagram, state?.diagram),
		ui: merge(defaultUiState, state?.ui),
		backup: state?.backup ? merge(defaultDiagram, state.backup) : undefined
	};
}

const defaultNode: DiagramNode = {
	id: "node1",
	type: "node",
	x: 0,
	y: 0,
	width: 100,
	height: 80,
	label: "Test Node",
	ports: {}
};

export function createNode(node: DeepPartial<DiagramNode>): DiagramNode {
	return merge(defaultNode, node);
}

const defaultConnectedEdge: ConnectedDiagramEdge = {
	id: "connected-edge1",
	type: "edge",
	anchors: [
		{ id: "a1", x: 0, y: 0 },
		{ id: "a2", x: 0, y: 50 }
	],
	sourceNodeId: "source",
	sourcePortId: "port1",
	targetNodeId: "target",
	targetPortId: "port2"
};

export function createConnectedEdge(edge: DeepPartial<ConnectedDiagramEdge>): ConnectedDiagramEdge {
	return merge(defaultConnectedEdge, edge);
}

const defaultUnconnectedEdge: UnconnectedDiagramEdge = {
	id: "unconnected-edge1",
	type: "edge",
	sourceNodeId: undefined,
	sourcePortId: undefined,
	targetNodeId: undefined,
	targetPortId: undefined,
	anchors: [
		{ id: "a1", x: 0, y: 0 },
		{ id: "a2", x: 0, y: 50 }
	]
};

export function createUnconnectedEdge(edge: DeepPartial<UnconnectedDiagramEdge>): UnconnectedDiagramEdge {
	return merge(defaultUnconnectedEdge, edge);
}

const defaultPort: DiagramPort = {
	id: "port1",
	type: "port",
	height: 5,
	width: 5,
	offset: { left: 0, top: 0 }
};

export function createPort(port: DeepPartial<DiagramPort>): DiagramPort {
	return merge(defaultPort, port);
}
