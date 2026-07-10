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

import { calculateAuxiliaryLines } from "../../../src/core/features/auxiliaryLines";
import { createNode } from "../../utils/diagramStateHelper";

describe("calculateAuxiliaryLines", () => {
	describe("vertical auxiliary lines", () => {
		it("should create line when nodes are vertically aligned", () => {
			const node1 = createNode({ x: 100, y: 100, width: 50, height: 50 });
			const node2 = createNode({ x: 100, y: 200, width: 50, height: 50 });
			const lines = calculateAuxiliaryLines(node1, node2);

			expect(lines).toHaveLength(2);
			expect(lines).toContainEqual({ point1: { x: 100, y: 200 }, point2: { x: 100, y: 150 } });
			expect(lines).toContainEqual({ point1: { x: 150, y: 200 }, point2: { x: 150, y: 150 } });
		});

		it("should not create vertical lines when nodes are not vertically aligned", () => {
			const node1 = createNode({ x: 100, y: 100, width: 50, height: 50 });
			const node2 = createNode({ x: 200, y: 200, width: 50, height: 50 });
			const lines = calculateAuxiliaryLines(node1, node2);

			const verticalLines = lines.filter(line => line.point1.x === line.point2.x);
			expect(verticalLines).toHaveLength(0);
		});
	});

	describe("horizontal auxiliary lines", () => {
		it("should create line when nodes are horizontally aligned on top edge", () => {
			const node1 = createNode({ x: 100, y: 100, width: 50, height: 50 });
			const node2 = createNode({ x: 200, y: 100, width: 50, height: 50 });
			const lines = calculateAuxiliaryLines(node1, node2);

			expect(lines).toHaveLength(2);
			expect(lines).toContainEqual({ point1: { x: 150, y: 100 }, point2: { x: 200, y: 100 } });
			expect(lines).toContainEqual({ point1: { x: 150, y: 150 }, point2: { x: 200, y: 150 } });
		});

		it("should not create horizontal lines when nodes are not horizontally aligned", () => {
			const node1 = createNode({ x: 100, y: 100, width: 50, height: 50 });
			const node2 = createNode({ x: 200, y: 200, width: 50, height: 50 });
			const lines = calculateAuxiliaryLines(node1, node2);

			const horizontalLines = lines.filter(line => line.point1.y === line.point2.y);
			expect(horizontalLines).toHaveLength(0);
		});
	});

	describe("edge cases", () => {
		it("should return no lines when nodes are overlapping", () => {
			const node1 = createNode({ x: 100, y: 100, width: 50, height: 50 });
			const node2 = createNode({ x: 125, y: 125, width: 50, height: 50 });
			const lines = calculateAuxiliaryLines(node1, node2);

			expect(lines).toHaveLength(0);
		});

		it("should return no lines when nodes are touching but not aligned", () => {
			const node1 = createNode({ x: 100, y: 100, width: 50, height: 50 });
			const node2 = createNode({ x: 150, y: 150, width: 50, height: 50 });
			const lines = calculateAuxiliaryLines(node1, node2);

			expect(lines).toHaveLength(0);
		});

		it("should work with nodes of different sizes", () => {
			const node1 = createNode({ x: 100, y: 100, width: 50, height: 50 });
			const node2 = createNode({ x: 100, y: 200, width: 100, height: 100 });
			const lines = calculateAuxiliaryLines(node1, node2);

			expect(lines).toHaveLength(1);
			expect(lines).toContainEqual({ point1: { x: 100, y: 200 }, point2: { x: 100, y: 150 } });
		});

		it("should handle nodes with zero dimensions", () => {
			const node1 = createNode({ x: 100, y: 100, width: 0, height: 0 });
			const node2 = createNode({ x: 100, y: 200, width: 0, height: 0 });
			const lines = calculateAuxiliaryLines(node1, node2);

			expect(lines).toHaveLength(2);
			expect(lines).toContainEqual({ point1: { x: 100, y: 200 }, point2: { x: 100, y: 100 } });
		});
	});
});
