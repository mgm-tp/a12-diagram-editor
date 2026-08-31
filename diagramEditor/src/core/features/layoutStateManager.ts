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
import { assertExists } from "../assertions";
import type { DiagramContainer } from "../diagram/container";

export type LayoutDirection = "LR" | "TB" | "RL" | "BT";
export type LayoutAlignment = "UL" | "UR" | "DL" | "DR";

export interface LayoutSettings {
	rankdir?: LayoutDirection | "parent";
	align?: LayoutAlignment | "parent";
}

/* Interface to allow custom layouting strategies.
 *
 * globalRankdir/globalAlign define defaults for each recursion depth.
 * Optional directions/alignments arrays override the defaults by depth index.
 * If a container has rankdir set, it overrides the strategy's direction.
 */
export interface LayoutStrategy {
	globalRankdir: LayoutDirection;
	globalAlign: LayoutAlignment;
	//allows to set alignment and direction per recursion depth
	alignments?: LayoutAlignment[];
	directions?: LayoutDirection[];
}

/** @internal */
export interface LayoutStrategyState {
	strategy: LayoutStrategy;
	counter: number;
	currentRankDir?: LayoutDirection;
	currentAlign?: LayoutAlignment;
}

export const DefaultStrategy: LayoutStrategy = { globalRankdir: "LR", globalAlign: "DL" };

export function advanceStrategyState(state: LayoutStrategyState, container?: DiagramContainer): LayoutStrategyState {
	const { strategy, counter } = state;
	const nextCounter = counter + 1;
	let currentRankDir = strategy.directions?.at(counter) ?? state.strategy.globalRankdir;
	let currentAlign = strategy.alignments?.at(counter) ?? state.strategy.globalAlign;

	if (container?.rankdir) {
		if (container.rankdir === "parent") {
			assertExists(state.currentRankDir, "Parent direction is not defined");
			currentRankDir = state.currentRankDir;
		} else {
			currentRankDir = container.rankdir;
		}
	}

	if (container?.align) {
		if (container.align === "parent") {
			assertExists(state.currentAlign, "Parent alignment is not defined");
			currentAlign = state.currentAlign;
		} else {
			currentAlign = container.align;
		}
	}
	return { strategy, counter: nextCounter, currentRankDir: currentRankDir, currentAlign };
}
