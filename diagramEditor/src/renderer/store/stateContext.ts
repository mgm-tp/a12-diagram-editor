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

import { createContext, useContext, useMemo } from "react";
import { useDispatch } from "react-redux";
import type { Dispatch } from "@reduxjs/toolkit";

import type { DiagramState } from "../../core/state";

import { useSelector, useStore } from "./hooks";

export type DiagramStateSelector = (state: object) => DiagramState;
/*
 * Context is only used to (greatly) enhance the code readability, since the selector needs to be passed by the using
 * project.
 */
export const DiagramStateContext = createContext<{
	selectDiagramState?: DiagramStateSelector;
	customDispatch?: Dispatch;
}>({});

export function useDiagramState<T>(lens: (state: DiagramState) => T, equalityFn?: (a: T, b: T) => boolean): T {
	const { selectDiagramState } = useContext(DiagramStateContext);
	return useSelector(state => {
		const data = selectDiagramState!(state);
		return lens(data);
	}, equalityFn);
}

/**
 * @internal
 */
export function useDiagramStateWithoutRerendering<T>(lens: (state: DiagramState) => T): () => T {
	const { selectDiagramState } = useContext(DiagramStateContext);
	const store = useStore();
	return () => {
		const data = selectDiagramState!(store.getState());
		return lens(data);
	};
}

export function useDiagramDispatch(): Dispatch {
	const context = useContext(DiagramStateContext);
	const dispatch = useDispatch();
	return useMemo(() => context.customDispatch ?? dispatch, [context.customDispatch, dispatch]);
}
