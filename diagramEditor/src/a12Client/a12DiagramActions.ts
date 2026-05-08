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



import { AnyAction } from "@reduxjs/toolkit";

import { diagramActions } from "../renderer/store/slice";

/**
 * Resolves the type of the first argument of a function type.
 * @example
 * function fn(arg1: MyObject, arg2: number): void {}
 * type FirstArg = FirstArgumentType<typeof fn>; // MyObject
 */
type FirstArgumentType<AnyFunction> = AnyFunction extends (first: infer FirstArgument, ...args: any[]) => any
	? FirstArgument
	: never;

/**
 * Extends an action creator function to include `activityId` in its payload. Considers if the payload type equals void
 * and returns an object with only activityId then.
 */
type ActionCreatorWithActivityId<AnyActionCreator> = (
	action: FirstArgumentType<AnyActionCreator> extends void
		? { activityId: string }
		: FirstArgumentType<AnyActionCreator> & { activityId: string }
) => AnyAction;

/**
 * This type maps each typed key to its corresponding action creator
 * @type [Key in keyof ActionMap]: The current **key** within the action map
 * @type ActionMap[Key]: The current **value** within the action map
 * @type ActionCreatorWithActivityId: Augments the action creator so that the action payload includes `activityId`
 *
 * @example
 * const actions = {
 *  action1: (payload: { data: string }) => AnyAction,
 *  action2: (payload: { id: number }) => AnyAction
 * }
 *
 * type ExtendedActions = ExtendActionMapWithActivityId<typeof actions>;
 * const extendedActions: ExtendedActions = actions;
 *
 * extendedActions.action1({ data: "example", activityId: "123" });
 * extendedActions.action2({ id: 42, activityId: "123" });
 */
type ExtendActionMapWithActivityId<ActionMap> = {
	[Key in keyof ActionMap]: ActionCreatorWithActivityId<ActionMap[Key]>;
};

type A12DiagramActions = ExtendActionMapWithActivityId<typeof diagramActions>;

export const a12DiagramActions: A12DiagramActions = diagramActions as unknown as A12DiagramActions;
