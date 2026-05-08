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



import { disconnectEdge } from "../../../src/core/features/disconnectEdge";
import { isUnconnectedEdge, UnconnectedDiagramEdge } from "../../../src/core/diagram/edge";
import { requireArgument } from "../../../src/core/assertions";
import { createConnectedEdge, createDiagramState, createNode } from "../../utils/diagramStateHelper";

describe("disconnectEdge", () => {
	it("should disconnect edge from source port", () => {
		const result = disconnectEdge("edge1", "port1", diagram);
		const disconnectedEdge = result.edges.edge1;
		requireArgument(isUnconnectedEdge(disconnectedEdge), "Disconnected edge should be unconnected");

		expect(disconnectedEdge.targetNodeId).toBe("node2");
		expect(disconnectedEdge.targetPortId).toBe("port2");
		expect(disconnectedEdge.sourceNodeId).toBeUndefined();
		expect(disconnectedEdge.sourcePortId).toBeUndefined();
		expect(disconnectedEdge.anchors).toEqual(edge.anchors);
	});

	it("should disconnect edge from target port", () => {
		const result = disconnectEdge("edge1", "port2", diagram);
		const disconnectedEdge = result.edges.edge1 as UnconnectedDiagramEdge;

		expect(disconnectedEdge.sourceNodeId).toBe("node1");
		expect(disconnectedEdge.sourcePortId).toBe("port1");
		expect(disconnectedEdge.targetNodeId).toBeUndefined();
		expect(disconnectedEdge.targetPortId).toBeUndefined();
		expect(disconnectedEdge.anchors).toEqual(edge.anchors);
	});
});

const edge = createConnectedEdge({
	id: "edge1",
	sourceNodeId: "node1",
	targetNodeId: "node2",
	sourcePortId: "port1",
	targetPortId: "port2",
	anchors: [
		{ id: "a1", x: 100, y: 100 },
		{ id: "a2", x: 200, y: 200 }
	]
});

const diagram = createDiagramState({
	diagram: {
		nodes: { node1: createNode({ id: "node1" }), node2: createNode({ id: "node2" }) },
		edges: { edge1: edge }
	}
}).diagram;
