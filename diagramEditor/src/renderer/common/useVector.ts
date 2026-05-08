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


import { useRef, MouseEvent } from "react";

import { Vector } from "../../core/geometry";

import { useDiagramState, useDiagramStateWithoutRerendering } from "../store/stateContext";

export function useStepSizedVector() {
	const { addMovementToVector, getVector, resetVector, subtractCommittedVector } = useVector();
	const stepSize = useDiagramState(state => state.ui.gridStepSize);

	return {
		addMovementToVector,
		getVector(): Vector {
			const vector = getVector();
			if (Math.abs(vector.x) < stepSize && Math.abs(vector.y) < stepSize) {
				return { x: 0, y: 0 };
			}
			const x = Math.round(vector.x / stepSize) * stepSize;
			const y = Math.round(vector.y / stepSize) * stepSize;
			return { x, y };
		},
		subtractCommittedVector,
		resetVector
	};
}

export function useVector() {
	/**
	 * We are using a refs here because addMovementToVector and getVector are called successively in the same event loop.
	 * If we would use useState, the values would not be up to date after addMovementToVector is called.
	 */
	const vectorRef = useRef({ x: 0, y: 0 });
	const getZoomLevel = useDiagramStateWithoutRerendering(state => state.ui.zoomLevel);
	const lastX = useRef<number | undefined>(undefined);
	const lastY = useRef<number | undefined>(undefined);

	return {
		addMovementToVector(event: MouseEvent): void {
			if (lastX.current === undefined || lastY.current === undefined) {
				// first move event
				lastX.current = event.clientX;
				lastY.current = event.clientY;
				return;
			}
			const zoomLevel = getZoomLevel();
			const deltaX = event.clientX - lastX.current;
			const deltaY = event.clientY - lastY.current;
			lastX.current = event.clientX;
			lastY.current = event.clientY;
			vectorRef.current.x += deltaX / (zoomLevel / 100);
			vectorRef.current.y += deltaY / (zoomLevel / 100);
		},
		getVector(): Vector {
			const x = Math.round(vectorRef.current.x);
			const y = Math.round(vectorRef.current.y);
			return { x, y };
		},
		subtractCommittedVector(committedVector: Vector): void {
			vectorRef.current.x -= committedVector.x;
			vectorRef.current.y -= committedVector.y;
		},
		resetVector(): void {
			vectorRef.current.x = 0;
			vectorRef.current.y = 0;
			lastX.current = undefined;
			lastY.current = undefined;
		}
	};
}
