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

import { createDiagramContainer } from "../../../src/core/diagram/container";
import type { LayoutStrategy } from "../../../src/core/features/layoutStateManager";
import { advanceStrategyState } from "../../../src/core/features/layoutStateManager";

const baseStrategy: LayoutStrategy = { globalRankdir: "LR", globalAlign: "DL" };

describe("advanceStrategyState", () => {
	it("should use global defaults when no per-depth overrides are provided", () => {
		const container = createDiagramContainer();

		const result = advanceStrategyState({ strategy: baseStrategy, counter: 0 }, container);

		expect(result.strategy).toEqual(baseStrategy);
		expect(result.currentRankDir).toBe("LR");
		expect(result.currentAlign).toBe("DL");
		expect(result.counter).toBe(1);
	});

	it("should use directions override at current depth", () => {
		const container = createDiagramContainer();

		const result = advanceStrategyState(
			{ strategy: { ...baseStrategy, directions: ["TB", "RL"] }, counter: 0 },
			container
		);

		expect(result.currentRankDir).toBe("TB");
		expect(result.counter).toBe(1);
	});

	it("should use alignments override at current depth", () => {
		const container = createDiagramContainer();

		const result = advanceStrategyState(
			{ strategy: { ...baseStrategy, alignments: ["UL", "UR"] }, counter: 1 },
			container
		);

		expect(result.currentAlign).toBe("UR");
		expect(result.counter).toBe(2);
	});

	it("should fall back to global values when depth overrides are out of range", () => {
		const container = createDiagramContainer();

		const result = advanceStrategyState(
			{ strategy: { ...baseStrategy, directions: ["TB"], alignments: ["UL"] }, counter: 3 },
			container
		);

		expect(result.currentRankDir).toBe("LR");
		expect(result.currentAlign).toBe("DL");
		expect(result.counter).toBe(4);
	});

	it("should use container rankdir over strategy direction", () => {
		const container = createDiagramContainer({ rankdir: "TB" });

		const result = advanceStrategyState({ strategy: { ...baseStrategy, directions: ["RL"] }, counter: 0 }, container);

		expect(result.currentRankDir).toBe("TB");
	});

	it("should use container align over strategy alignment", () => {
		const container = createDiagramContainer({ align: "UL" });

		const result = advanceStrategyState({ strategy: { ...baseStrategy, alignments: ["DR"] }, counter: 0 }, container);

		expect(result.currentAlign).toBe("UL");
	});

	it("should use parent alignment when container align is 'parent'", () => {
		const container = createDiagramContainer({ align: "parent" });

		const result = advanceStrategyState({ strategy: baseStrategy, counter: 0, currentAlign: "UR" }, container);

		expect(result.currentAlign).toBe("UR");
	});

	it("should not mutate the original state", () => {
		const container = createDiagramContainer();
		const state: { strategy: LayoutStrategy; counter: number } = {
			strategy: { ...baseStrategy, directions: ["TB"], alignments: ["UR"] },
			counter: 0
		};

		advanceStrategyState(state, container);

		expect(state.counter).toBe(0);
		expect(state.strategy.globalRankdir).toBe("LR");
		expect(state.strategy.globalAlign).toBe("DL");
	});
});
