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

import { createConnectedEdge } from "../../../src/core/diagram/edge";
import { createNode, createPort } from "../../utils/diagramStateHelper";

describe("createConnectedEdge", () => {
	it("should create a straight edge between two parallel nodes", () => {
		const node1 = createNode({ id: "node1", x: 100, y: 0, width: 100, height: 100 });
		const port1 = createPort({ id: "port1", offset: { left: 0, top: 0 } });
		const node2 = createNode({ id: "node2", x: 500, y: 0, width: 100, height: 100 });
		const port2 = createPort({ id: "port2", offset: { left: 0, top: 0 } });

		const edge = createConnectedEdge(node1, port1, node2, port2);

		expect(edge.sourceNodeId).toBe("node1");
		expect(edge.sourcePortId).toBe("port1");
		expect(edge.targetNodeId).toBe("node2");
		expect(edge.targetPortId).toBe("port2");
		expect(edge.anchors.length).toBe(2);
		const firstAnchor = edge.anchors[0];
		const lastAnchor = edge.anchors[edge.anchors.length - 1];
		expect(firstAnchor.x).toBe(100);
		expect(firstAnchor.y).toBe(0);
		expect(lastAnchor.x).toBe(500);
		expect(lastAnchor.y).toBe(0);
	});

	it("should create a right angle edge between not parallel nodes", () => {
		const node1 = createNode({ id: "node1", x: 0, y: 0, width: 100, height: 100 });
		const port1 = createPort({ id: "port1", offset: { left: 0, top: 0 } });
		const node2 = createNode({ id: "node2", x: 500, y: 500, width: 100, height: 100 });
		const port2 = createPort({ id: "port2", offset: { left: 0, top: 0 } });

		const edge = createConnectedEdge(node1, port1, node2, port2);

		expect(edge.anchors.length).toBe(3);
		const firstAnchor = edge.anchors[0];
		const middleAnchor = edge.anchors[1];
		const lastAnchor = edge.anchors[edge.anchors.length - 1];
		expect(firstAnchor.x).toBe(0);
		expect(firstAnchor.y).toBe(0);
		expect(middleAnchor.x).toBe(0);
		expect(middleAnchor.y).toBe(500);
		expect(lastAnchor.x).toBe(500);
		expect(lastAnchor.y).toBe(500);
	});
});
