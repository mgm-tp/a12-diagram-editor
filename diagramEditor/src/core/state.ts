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

import { assertExists, requireArgument } from "./assertions";
import type { DiagramContainer } from "./diagram/container";
import type { Diagram } from "./diagram/diagram";
import type { DiagramEdge } from "./diagram/edge";
import type { DiagramNode } from "./diagram/node";
import type { DiagramPort } from "./diagram/port";
import type { DiagramDialogState } from "./features/dialog";
import type { Offset } from "./geometry";

export interface DiagramState {
	canvasId: string;
	diagram: Diagram;
	ui: UIState;
	dialog?: DiagramDialogState;
	backup?: Diagram;
}

export interface UIState {
	zoomLevel: number;
	offset: Offset;
	readonly: boolean;
	/**
	 * @key Ids of readonly nodes and edges, other elements cannot be set to readonly on their own
	 */
	readonlyElements: Record<string, true>;

	/**
	 * @key Ids of selected nodes and edges; other elements cannot be selected on their own
	 */
	selectedElements: Record<string, true>;
	foregroundElements: string[];
	backgroundElements: string[];
	showGrid: boolean;
	gridStepSize: number;
	isDragging: boolean;
}

export function isSelected(id: string, selectedElements: Record<string, boolean>): boolean {
	return id in selectedElements;
}

export function isReadonly(id: string, readOnlyElements: Record<string, boolean>): boolean {
	return id in readOnlyElements;
}

export function isEdge(id: string, diagram: Diagram): boolean {
	return edgeExists(id, diagram);
}

export function isNode(id: string, diagram: Diagram): boolean {
	return nodeExists(id, diagram);
}

export function isContainer(id: string, diagram: Diagram): boolean {
	return id in diagram.containers;
}

export function getNode(nodeId: string, diagram: Diagram): DiagramNode {
	requireArgument(isNode(nodeId, diagram), `Node with id ${nodeId} not found in diagram`);
	return diagram.nodes[nodeId];
}

export function getEdge(edgeId: string, diagram: Diagram): DiagramEdge {
	requireArgument(isEdge(edgeId, diagram), `Edge with id ${edgeId} not found in diagram`);
	return diagram.edges[edgeId];
}

export function getPort(portId: string, diagram: Diagram): DiagramPort {
	const node = Object.values(diagram.nodes).find(n => n.ports[portId]);
	assertExists(node, `Node with portId ${portId} not found in diagram`);
	return node.ports[portId];
}

export function updateEdge(edge: DiagramEdge, state: DiagramState): DiagramState {
	requireArgument(edgeExists(edge.id, state.diagram), `Edge with id ${edge.id} not found in diagram`);
	return { ...state, diagram: { ...state.diagram, edges: { ...state.diagram.edges, [edge.id]: edge } } };
}

export function updateNode(node: DiagramNode, state: DiagramState): DiagramState {
	requireArgument(nodeExists(node.id, state.diagram), `Node with id ${node.id} not found in diagram`);
	return { ...state, diagram: { ...state.diagram, nodes: { ...state.diagram.nodes, [node.id]: node } } };
}

export function updateContainer(container: DiagramContainer, state: DiagramState): DiagramState {
	requireArgument(
		containerExists(container.id, state.diagram),
		`Container with id ${container.id} not found in diagram`
	);
	return {
		...state,
		diagram: { ...state.diagram, containers: { ...state.diagram.containers, [container.id]: container } }
	};
}

export function insertEdge(edge: DiagramEdge, state: DiagramState): DiagramState {
	requireArgument(!edgeExists(edge.id, state.diagram), `Edge with id ${edge.id} already exists in diagram`);
	return { ...state, diagram: { ...state.diagram, edges: { ...state.diagram.edges, [edge.id]: edge } } };
}

export function insertNode(node: DiagramNode, state: DiagramState): DiagramState {
	requireArgument(!nodeExists(node.id, state.diagram), `Node with id ${node.id} already exists in diagram`);
	return { ...state, diagram: { ...state.diagram, nodes: { ...state.diagram.nodes, [node.id]: node } } };
}

export function insertContainer(container: DiagramContainer, state: DiagramState): DiagramState {
	requireArgument(
		!(container.id in state.diagram.containers),
		`Container with id ${container.id} already exists in diagram`
	);
	return {
		...state,
		diagram: { ...state.diagram, containers: { ...state.diagram.containers, [container.id]: container } }
	};
}

function edgeExists(edgeId: string, diagram: Diagram): boolean {
	return edgeId in diagram.edges;
}

function nodeExists(nodeId: string, diagram: Diagram): boolean {
	return nodeId in diagram.nodes;
}

function containerExists(containerId: string, diagram: Diagram): boolean {
	return containerId in diagram.containers;
}

export function restoreBackup(state: DiagramState): DiagramState {
	return { ...state, diagram: state.backup ?? state.diagram, backup: undefined };
}
