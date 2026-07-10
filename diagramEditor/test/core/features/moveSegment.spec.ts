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

import { moveSegment } from "../../../src/core/features/moveEdgeSegment";
import type { Diagram } from "../../../src/core/diagram/diagram";
import type { Vector } from "../../../src/core/geometry";
import { createConnectedEdge, createDiagramState } from "../../utils/diagramStateHelper";

describe("moveRightAngleEdgeWidget", () => {
	describe("segment movement", () => {
		it("should move a horizontal segment vertically", () => {
			const vector = { x: 0, y: 50 };
			const diagram = createBaseDiagram([
				{ x: 100, y: 100 },
				{ x: 100, y: 200 },
				{ x: 200, y: 200 },
				{ x: 200, y: 300 }
			]);

			const result = moveSegment("edge1", "a2", vector, diagram);
			expect(result.edges.edge1.anchors).toEqual([
				{ id: "a1", x: 100, y: 100 },
				{ id: "a2", x: 100, y: 250 },
				{ id: "a3", x: 200, y: 250 },
				{ id: "a4", x: 200, y: 300 }
			]);
		});

		it("should move a vertical segment horizontally", () => {
			const vector = { x: 50, y: 0 };
			const diagram = createBaseDiagram([
				{ x: 100, y: 100 },
				{ x: 200, y: 100 },
				{ x: 200, y: 200 },
				{ x: 300, y: 200 }
			]);

			const result = moveSegment("edge1", "a2", vector, diagram);
			expect(result.edges.edge1.anchors).toEqual([
				{ id: "a1", x: 100, y: 100 },
				{ id: "a2", x: 250, y: 100 },
				{ id: "a3", x: 250, y: 200 },
				{ id: "a4", x: 300, y: 200 }
			]);
		});
	});

	describe("edge cases", () => {
		it("should throw for non-existent edge ID", () => {
			const vector = { x: 50, y: 0 };
			const diagram = createBaseDiagram([
				{ x: 100, y: 100 },
				{ x: 100, y: 200 },
				{ x: 200, y: 200 }
			]);

			expect(() => moveSegment("nonexistent", "a2", vector, diagram)).toThrow();
		});

		it("should throw for non-existent anchor ID", () => {
			const vector = { x: 50, y: 0 };
			const diagram = createBaseDiagram([
				{ x: 100, y: 100 },
				{ x: 100, y: 200 },
				{ x: 200, y: 200 }
			]);

			expect(() => moveSegment("edge1", "nonexistent", vector, diagram)).toThrow();
		});

		it("should preserve anchor IDs after movement", () => {
			const vector = { x: 50, y: 0 };
			const diagram = createBaseDiagram([
				{ x: 100, y: 100 },
				{ x: 100, y: 200 },
				{ x: 200, y: 200 }
			]);

			const result = moveSegment("edge1", "a2", vector, diagram);
			result.edges.edge1.anchors.forEach((anchor, index) => {
				expect(anchor.id).toBe(`a${index + 1}`);
			});
		});
	});
});

function createBaseDiagram(anchors: Vector[]): Diagram {
	const edge = createConnectedEdge({
		id: "edge1",
		type: "edge",
		sourceNodeId: "node1",
		targetNodeId: "node2",
		anchors: anchors.map((pos, index) => ({ id: `a${index + 1}`, ...pos }))
	});

	return createDiagramState({ diagram: { edges: { [edge.id]: edge } } }).diagram;
}
