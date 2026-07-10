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

/**
 * @fileoverview Tests for geometry functions
 */

import type { Point, Line } from "../../src/core/geometry";
import { isSamePoint, isRightAngle, isOrthogonalLine, calculateAngle } from "../../src/core/geometry";

describe("Geometry", () => {
	describe("isSamePoint", () => {
		it("should return true for points with same coordinates", () => {
			const point1: Point = { x: 1, y: 1 };
			const point2: Point = { x: 1, y: 1 };

			expect(isSamePoint(point1, point2)).toBe(true);
		});

		it("should return false for different points", () => {
			const point1: Point = { x: 1, y: 1 };
			const point2: Point = { x: 2, y: 2 };

			expect(isSamePoint(point1, point2)).toBe(false);
		});
	});

	describe("isRightAngle", () => {
		it("should return true for horizontal then vertical segments", () => {
			const left: Point = { x: 0, y: 0 };
			const middle: Point = { x: 2, y: 0 };
			const right: Point = { x: 2, y: 2 };

			expect(isRightAngle(left, middle, right)).toBe(true);
		});

		it("should return true for vertical then horizontal segments", () => {
			const left: Point = { x: 0, y: 0 };
			const middle: Point = { x: 0, y: 2 };
			const right: Point = { x: 2, y: 2 };

			expect(isRightAngle(left, middle, right)).toBe(true);
		});

		it("should return false for non-right angles", () => {
			const left: Point = { x: 0, y: 0 };
			const middle: Point = { x: 1, y: 1 };
			const right: Point = { x: 2, y: 2 };

			expect(isRightAngle(left, middle, right)).toBe(false);
		});

		it("should return false for straight line", () => {
			const left: Point = { x: 0, y: 0 };
			const middle: Point = { x: 1, y: 0 };
			const right: Point = { x: 2, y: 0 };

			expect(isRightAngle(left, middle, right)).toBe(false);
		});
	});

	describe("isOrthogonalLine", () => {
		it("should return true for horizontal line", () => {
			const point1: Point = { x: 0, y: 0 };
			const point2: Point = { x: 2, y: 0 };

			expect(isOrthogonalLine(point1, point2)).toBe(true);
		});

		it("should return true for vertical line", () => {
			const point1: Point = { x: 0, y: 0 };
			const point2: Point = { x: 0, y: 2 };

			expect(isOrthogonalLine(point1, point2)).toBe(true);
		});

		it("should return false for diagonal line", () => {
			const point1: Point = { x: 0, y: 0 };
			const point2: Point = { x: 1, y: 1 };

			expect(isOrthogonalLine(point1, point2)).toBe(false);
		});
	});

	describe("calculateAngle", () => {
		it("should return the correct orthogonal angles", () => {
			const upwardsLine: Line = { point1: { x: 0, y: 0 }, point2: { x: 0, y: 2 } };
			const rightwardsLine: Line = { point1: { x: 0, y: 0 }, point2: { x: 2, y: 0 } };
			const downwardsLine: Line = { point1: { x: 0, y: 0 }, point2: { x: 0, y: -2 } };
			const leftwardsLine: Line = { point1: { x: 0, y: 0 }, point2: { x: -2, y: 0 } };

			expect(calculateAngle(upwardsLine)).toBe(0);
			expect(calculateAngle(rightwardsLine)).toBe(90);
			expect(calculateAngle(downwardsLine)).toBe(180);
			expect(calculateAngle(leftwardsLine)).toBe(270);
		});

		it("should converge to 360° for a line just left of the vertical axis", () => {
			const line: Line = { point1: { x: 0, y: 0 }, point2: { x: -1, y: 100_000_000 } };
			const result = calculateAngle(line);
			expect(result).toBeGreaterThan(359.99);
			expect(result).toBeLessThan(360);
		});

		it("should return 0 for the same points", () => {
			const line: Line = { point1: { x: 0, y: 0 }, point2: { x: 0, y: 0 } };
			expect(calculateAngle(line)).toBe(0);
		});
	});
});
