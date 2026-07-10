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

export interface Point {
	x: number;
	y: number;
}

export interface Offset {
	top: number;
	left: number;
}

export interface Rectangle {
	width: number;
	height: number;
}

export interface Vector {
	x: number;
	y: number;
}
export interface Line {
	point1: Point;
	point2: Point;
}

export interface Area {
	topLeft: Point;
	rectangle: Rectangle;
}

export function getAreaFromPoints(p1: Point, p2: Point): Area {
	const topLeft = { x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y) };
	const rectangle = { width: Math.abs(p2.x - p1.x), height: Math.abs(p2.y - p1.y) };
	return { topLeft, rectangle };
}

export function isPointInArea(area: Area, point: Point): boolean {
	const { topLeft, rectangle } = area;
	return (
		point.x >= topLeft.x &&
		point.x <= topLeft.x + rectangle.width &&
		point.y >= topLeft.y &&
		point.y <= topLeft.y + rectangle.height
	);
}

export function isSamePoint(point1: Point, point2: Point) {
	return point1.x === point2.x && point1.y === point2.y;
}

export function isRightAngle(leftPoint: Point, middlePoint: Point, rightPoint: Point) {
	const variant1 = isHorizontalLine(leftPoint, middlePoint) && isVerticalLine(middlePoint, rightPoint);
	const variant2 = isVerticalLine(leftPoint, middlePoint) && isHorizontalLine(middlePoint, rightPoint);
	return variant1 || variant2;
}

export function isOrthogonalLine(point1: Point, point2: Point) {
	return isHorizontalLine(point1, point2) || isVerticalLine(point1, point2);
}

export function isHorizontalLine(point1: Point, point2: Point) {
	return point1.y === point2.y;
}

export function isVerticalLine(point1: Point, point2: Point) {
	return point1.x === point2.x;
}

export function resolveLineOrientation(line: Line): "horizontal" | "vertical" | "diagonal" {
	if (isHorizontalLine(line.point1, line.point2)) {
		return "horizontal";
	} else if (isVerticalLine(line.point1, line.point2)) {
		return "vertical";
	} else {
		return "diagonal";
	}
}

export function calculateDistance(point1: Point, point2: Point): number {
	const dx = point2.x - point1.x;
	const dy = point2.y - point1.y;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the angle of the line to a vertical line.
 * Upwards: 0°, Right: 90°, Downwards: 180°, Left: 270°
 * @returns angle in degrees
 */
export function calculateAngle(line: Line) {
	const dx = line.point2.x - line.point1.x;
	const dy = line.point2.y - line.point1.y;
	const angleInDegrees = Math.atan2(dx, dy) * (180 / Math.PI);
	if (angleInDegrees < 0) {
		return angleInDegrees + 360;
	}
	return angleInDegrees;
}

export function isRectangleContainedInArea(rectangle: Rectangle & Point, area: Area): boolean {
	const topLeft = { x: rectangle.x, y: rectangle.y };
	const bottomRight = {
		x: rectangle.x + rectangle.width,
		y: rectangle.y + rectangle.height
	};
	return isPointInArea(area, topLeft) && isPointInArea(area, bottomRight);
}
