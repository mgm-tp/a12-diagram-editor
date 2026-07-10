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

import { connectEdge } from "../../../src/core/features/connectEdge";
import type { ConnectedDiagramEdge } from "../../../src/core/diagram/edge";
import {
	createConnectedEdge,
	createDiagramState,
	createNode,
	createUnconnectedEdge
} from "../../utils/diagramStateHelper";

describe("connectEdge", () => {
	it("should connect edge to target port", () => {
		const state = createDiagramState({
			diagram: {
				nodes: { [sourceNode.id]: sourceNode, [targetNode.id]: targetNode },
				edges: { [unconnectedEdge.id]: unconnectedEdge }
			}
		});
		const result = connectEdge(unconnectedEdge.id, "port2", state);

		const resultEdge = result.edges[unconnectedEdge.id] as ConnectedDiagramEdge;
		expect(resultEdge.sourceNodeId).toBe("source");
		expect(resultEdge.targetNodeId).toBe("target");

		expect(resultEdge.anchors.length).toBe(3);
		expect(resultEdge.anchors[0].x).toBe(0);
		expect(resultEdge.anchors[0].y).toBe(0);
		expect(resultEdge.anchors[1].x).toBe(100);
		expect(resultEdge.anchors[1].y).toBe(0);
		expect(resultEdge.anchors[2].x).toBe(100);
		expect(resultEdge.anchors[2].y).toBe(100);
	});

	it("should throw if there is no unconnected edge", () => {
		const stateWithoutEdge = createDiagramState({ diagram: { edges: {} } });
		const stateWithConnectedEdge = createDiagramState({ diagram: { edges: { [connectedEdge.id]: connectedEdge } } });

		expect(() => connectEdge("edge1", "port2", stateWithoutEdge)).toThrow();
		expect(() => connectEdge("edge1", "port2", stateWithConnectedEdge)).toThrow();
	});
});

const sourceNode = createNode({
	id: "source",
	x: 0,
	y: 0,
	ports: { port1: { id: "port1", offset: { top: 0, left: 0 } } }
});

const targetNode = createNode({
	id: "target",
	x: 100,
	y: 100,
	ports: { port2: { id: "port2", offset: { top: 0, left: 0 } } }
});

const unconnectedEdge = createUnconnectedEdge({
	sourceNodeId: "source",
	sourcePortId: "port1",
	anchors: [
		{ id: "a1", x: 0, y: 0 },
		{ id: "a2", x: 0, y: 50 }
	]
});

const connectedEdge = createConnectedEdge({
	targetNodeId: "target",
	targetPortId: "port2",
	sourceNodeId: "source",
	sourcePortId: "port1",
	anchors: [
		{ id: "a1", x: 0, y: 0 },
		{ id: "a2", x: 0, y: 100 }
	]
});
