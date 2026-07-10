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

import { createContext, useContext } from "react";

import type { CanvasEventHandlers } from "../../canvas/canvasEventHandlers";
import { useCanvasEventHandlers, useDefaultCanvasEventHandlers } from "../../canvas/canvasEventHandlers";
import type { CommonEventHandlers } from "../../common/commonEventHandlers";
import { useCommonEventHandlers, useDefaultCommonEventHandlers } from "../../common/commonEventHandlers";
import type { ContainerEventHandlers } from "../../container/containerEventHandlers";
import { useContainerEventHandlers, useDefaultContainerEventHandlers } from "../../container/containerEventHandlers";
import type { EdgeEventHandlers } from "../../edge/edgeEventHandlers";
import { useDefaultEdgeEventHandlers, useEdgeEventHandlers } from "../../edge/edgeEventHandlers";
import type { NodeEventHandlers } from "../../node/nodeEventHandlers";
import { useDefaultNodeEventHandlers, useNodeEventHandlers } from "../../node/nodeEventHandlers";
import type { PortEventHandlers } from "../../port/portEventHandlers";
import { useDefaultPortEventHandlers, usePortEventHandlers } from "../../port/portEventHandlers";

export type RequiredDiagramEventHandlerMap = CanvasEventHandlers &
	NodeEventHandlers &
	EdgeEventHandlers &
	PortEventHandlers &
	ContainerEventHandlers &
	CommonEventHandlers;

export type DiagramEventHandlerMap = Partial<RequiredDiagramEventHandlerMap>;

export const DiagramEventHandlerContext = createContext<(() => DiagramEventHandlerMap) | undefined>(undefined);

export function useEventHandlers(): RequiredDiagramEventHandlerMap {
	const commonEventHandlers = useCommonEventHandlers();
	const canvasEventHandlers = useCanvasEventHandlers();
	const nodeEventHandlers = useNodeEventHandlers();
	const edgeEventHandlers = useEdgeEventHandlers();
	const portEventHandlers = usePortEventHandlers();
	const containerEventHandlers = useContainerEventHandlers();

	return {
		...commonEventHandlers,
		...canvasEventHandlers,
		...nodeEventHandlers,
		...edgeEventHandlers,
		...portEventHandlers,
		...containerEventHandlers
	};
}

export function useDefaultEventHandlers(): DiagramEventHandlerMap {
	const commonEventHandlers = useDefaultCommonEventHandlers();
	const canvasEventHandlers = useDefaultCanvasEventHandlers();
	const nodeEventHandlers = useDefaultNodeEventHandlers();
	const edgeEventHandlers = useDefaultEdgeEventHandlers();
	const portEventHandlers = useDefaultPortEventHandlers();
	const containerEventHandlers = useDefaultContainerEventHandlers();

	return {
		...commonEventHandlers,
		...canvasEventHandlers,
		...nodeEventHandlers,
		...edgeEventHandlers,
		...portEventHandlers,
		...containerEventHandlers
	};
}

export function useCustomEventHandlers(): DiagramEventHandlerMap {
	const useCustomEventHandlers = useContext(DiagramEventHandlerContext);
	return useCustomEventHandlers?.() ?? {};
}
