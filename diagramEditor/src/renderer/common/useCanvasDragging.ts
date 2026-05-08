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

import React, { useState } from "react";

import { useCanvasContext } from "../canvas/canvasContext";
import { MouseEventHandler } from "../utils/htmlHelper";
import { isLeftMouseKey, isRightMouseKey } from "../utils/inputKeys";
import { useCanvasEventHandlers } from "../canvas/canvasEventHandlers";

export function useCanvasDragging(
	onDrag: MouseEventHandler,
	onDragEnd: MouseEventHandler,
	mouseKey: "left" | "right" = "left"
) {
	const canvasContext = useCanvasContext();
	const [isDragging, setIsDragging] = useState(false);
	const { onCanvasLeftClicked } = useCanvasEventHandlers();
	const isTargetMouseKey = mouseKey === "left" ? isLeftMouseKey : isRightMouseKey;

	if (isDragging) {
		canvasContext.setOnMouseMove(onMouseMove);
		canvasContext.setOnMouseUp(onMouseUpWhileDragging);
	}

	return () => {
		document.getSelection()?.empty();
		canvasContext.setOnMouseMove(onMouseMove);
		canvasContext.setOnMouseUp(onMouseUpWithoutDragging);
	};

	function onMouseMove(e: React.MouseEvent) {
		setIsDragging(true);
		onDrag(e);
	}

	function onMouseUpWithoutDragging(event: React.MouseEvent) {
		if (isTargetMouseKey(event)) {
			onCanvasLeftClicked();
			reset(event);
		}
	}

	function onMouseUpWhileDragging(event: React.MouseEvent) {
		if (isTargetMouseKey(event)) {
			onDragEnd(event);
			reset(event);
		}
	}

	function reset(e: React.MouseEvent) {
		setIsDragging(false);
		canvasContext.clear();
	}
}
