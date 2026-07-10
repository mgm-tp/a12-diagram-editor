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

import type { UIState } from "../state";
import type { Point } from "../geometry";

// A delta of 100 corresponds to a zoom factor change of 20%
export function applyZoom(delta: number, uiState: UIState, diagramPosition: Point): UIState {
	if (!Number.isFinite(delta)) {
		return uiState;
	}
	const factor = delta / 100;
	// Adjust the sensitivity of the zoom
	const adjustedFactor = factor / 5;
	const oldZoomFactor = uiState.zoomLevel / 100;
	const newZoomFactor = oldZoomFactor * (1 - adjustedFactor);
	const limitedZoomFactor = Math.max(0.05, newZoomFactor);
	// Calculate new offset so that the diagramPosition stays under the mouse
	const offset = {
		left: uiState.offset.left - (diagramPosition.x * limitedZoomFactor - diagramPosition.x * oldZoomFactor),
		top: uiState.offset.top - (diagramPosition.y * limitedZoomFactor - diagramPosition.y * oldZoomFactor)
	};
	return { ...uiState, zoomLevel: limitedZoomFactor * 100, offset };
}
