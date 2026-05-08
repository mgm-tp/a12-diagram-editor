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



import { resizeElement } from "../../../src/core/features/resizeElement";
import { createDiagramState, createNode, createConnectedEdge, createPort } from "../../utils/diagramStateHelper";
import { createDiagramContainer } from "../../../src/core/diagram/container";

describe("resizeElement", () => {
	describe("resizing nodes", () => {
		describe("corner resize orientations", () => {
			it("should resize from top-left corner", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 20, y: 15 };

				const result = resizeElement("node1", "top-left", vector, diagram);

				expect(result.nodes.node1.x).toBe(120);
				expect(result.nodes.node1.y).toBe(115);
				expect(result.nodes.node1.width).toBe(130);
				expect(result.nodes.node1.height).toBe(85);
			});

			it("should resize from top-right corner", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 25, y: 10 };

				const result = resizeElement("node1", "top-right", vector, diagram);

				expect(result.nodes.node1.x).toBe(100);
				expect(result.nodes.node1.y).toBe(110);
				expect(result.nodes.node1.width).toBe(175);
				expect(result.nodes.node1.height).toBe(90);
			});

			it("should resize from bottom-left corner", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 30, y: 20 };

				const result = resizeElement("node1", "bottom-left", vector, diagram);

				expect(result.nodes.node1.x).toBe(130);
				expect(result.nodes.node1.y).toBe(100);
				expect(result.nodes.node1.width).toBe(120);
				expect(result.nodes.node1.height).toBe(120);
			});

			it("should resize from bottom-right corner", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 40, y: 30 };

				const result = resizeElement("node1", "bottom-right", vector, diagram);

				expect(result.nodes.node1.x).toBe(100);
				expect(result.nodes.node1.y).toBe(100);
				expect(result.nodes.node1.width).toBe(190);
				expect(result.nodes.node1.height).toBe(130);
			});
		});

		describe("edge resize orientations", () => {
			it("should resize from left edge", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 25, y: 0 };

				const result = resizeElement("node1", "left", vector, diagram);

				expect(result.nodes.node1.x).toBe(125);
				expect(result.nodes.node1.y).toBe(100);
				expect(result.nodes.node1.width).toBe(125);
				expect(result.nodes.node1.height).toBe(100);
			});

			it("should resize from right edge", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 35, y: 0 };

				const result = resizeElement("node1", "right", vector, diagram);

				expect(result.nodes.node1.x).toBe(100);
				expect(result.nodes.node1.y).toBe(100);
				expect(result.nodes.node1.width).toBe(185);
				expect(result.nodes.node1.height).toBe(100);
			});

			it("should resize from top edge", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 0, y: 20 };

				const result = resizeElement("node1", "top", vector, diagram);

				expect(result.nodes.node1.x).toBe(100);
				expect(result.nodes.node1.y).toBe(120);
				expect(result.nodes.node1.width).toBe(150);
				expect(result.nodes.node1.height).toBe(80);
			});

			it("should resize from bottom edge", () => {
				const node = createNode({ id: "node1", x: 100, y: 100, width: 150, height: 100 });
				const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
				const vector = { x: 0, y: 45 };

				const result = resizeElement("node1", "bottom", vector, diagram);

				expect(result.nodes.node1.x).toBe(100);
				expect(result.nodes.node1.y).toBe(100);
				expect(result.nodes.node1.width).toBe(150);
				expect(result.nodes.node1.height).toBe(145);
			});
		});
	});

	describe("resizing containers", () => {
		it("should resize a container from bottom-right corner", () => {
			const container = createDiagramContainer({ id: "container1", x: 50, y: 50, width: 200, height: 150 });
			const diagram = createDiagramState({ diagram: { containers: { container1: container } } }).diagram;
			const vector = { x: 30, y: 25 };

			const result = resizeElement("container1", "bottom-right", vector, diagram);

			expect(result.containers.container1.x).toBe(50);
			expect(result.containers.container1.y).toBe(50);
			expect(result.containers.container1.width).toBe(230);
			expect(result.containers.container1.height).toBe(175);
		});

		it("should resize a container from top-left corner", () => {
			const container = createDiagramContainer({ id: "container1", x: 100, y: 100, width: 200, height: 150 });
			const diagram = createDiagramState({ diagram: { containers: { container1: container } } }).diagram;
			const vector = { x: 20, y: 15 };

			const result = resizeElement("container1", "top-left", vector, diagram);

			expect(result.containers.container1.x).toBe(120);
			expect(result.containers.container1.y).toBe(115);
			expect(result.containers.container1.width).toBe(180);
			expect(result.containers.container1.height).toBe(135);
		});
	});

	describe("minimum size enforcement", () => {
		it("should enforce minimum width of 30px", () => {
			const node = createNode({ id: "node1", x: 100, y: 100, width: 50, height: 50 });
			const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
			const vector = { x: -20, y: 0 };

			const result = resizeElement("node1", "right", vector, diagram);
			expect(result.nodes.node1.width).toBe(30);

			const result2 = resizeElement("node1", "right", vector, result);
			expect(result2.nodes.node1.height).toBe(50);
		});

		it("should enforce minimum height of 30px", () => {
			const node = createNode({ id: "node1", x: 100, y: 100, width: 50, height: 50 });
			const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
			const vector = { x: 0, y: -20 };

			const result = resizeElement("node1", "bottom", vector, diagram);
			expect(result.nodes.node1.height).toBe(30);

			const result2 = resizeElement("node1", "bottom", vector, result);
			expect(result2.nodes.node1.height).toBe(30);
		});
	});

	describe("port repositioning", () => {
		it("should reposition ports proportionally when resizing", () => {
			const port1 = createPort({ id: "port1", offset: { left: 50, top: 25 } });
			const port2 = createPort({ id: "port2", offset: { left: 100, top: 75 } });
			const node = createNode({ id: "node1", x: 100, y: 100, width: 100, height: 100, ports: { port1, port2 } });
			const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
			const vector = { x: 50, y: 40 };

			const result = resizeElement("node1", "bottom-right", vector, diagram);

			expect(result.nodes.node1.ports.port1.offset).toEqual({ left: 75, top: 35 });
			expect(result.nodes.node1.ports.port2.offset).toEqual({ left: 150, top: 105 });
		});
	});

	describe("connected edge updates", () => {
		it("should update connected edge anchors when node is resized", () => {
			const port1 = createPort({ id: "port1", offset: { left: 50, top: 0 } });
			const node1 = createNode({ id: "node1", x: 100, y: 100, width: 100, height: 100, ports: { port1 } });
			const edge1 = createConnectedEdge({
				id: "edge1",
				sourceNodeId: "node1",
				sourcePortId: "port1",
				anchors: [
					{ id: "a1", x: 150, y: 100 },
					{ id: "a2", x: 200, y: 200 }
				]
			});
			const diagram = createDiagramState({ diagram: { nodes: { node1 }, edges: { edge1 } } }).diagram;
			const vector = { x: 40, y: 0 };

			const result = resizeElement("node1", "right", vector, diagram);

			expect(result.edges.edge1.anchors[0].x).toBe(170);
			expect(result.edges.edge1.anchors[0].y).toBe(100);
			expect(result.edges.edge1.anchors.length).toBeGreaterThanOrEqual(2);
		});

		it("should handle multiple connected edges", () => {
			const port1 = createPort({ id: "port1", offset: { left: 0, top: 50 } });
			const port2 = createPort({ id: "port2", offset: { left: 100, top: 50 } });
			const port3 = createPort({ id: "port3" });
			const node1 = createNode({ id: "node1", x: 100, y: 100, width: 100, height: 100, ports: { port1, port2 } });
			const node2 = createNode({ id: "node2", x: 300, y: 300, width: 100, height: 100, ports: { port3 } });
			const edge1 = createConnectedEdge({
				id: "edge1",
				sourceNodeId: "node1",
				sourcePortId: "port1",
				targetNodeId: "node2",
				targetPortId: "port3",
				anchors: [
					{ id: "a1", x: 100, y: 150 },
					{ id: "a2", x: 300, y: 350 }
				]
			});
			const edge2 = createConnectedEdge({
				id: "edge2",
				sourceNodeId: "node1",
				sourcePortId: "port2",
				targetNodeId: "node2",
				targetPortId: "port3",
				anchors: [
					{ id: "a3", x: 200, y: 150 },
					{ id: "a4", x: 300, y: 350 }
				]
			});
			const diagram = createDiagramState({ diagram: { nodes: { node1, node2 }, edges: { edge1, edge2 } } }).diagram;
			const vector = { x: 50, y: 0 };

			const result = resizeElement("node1", "right", vector, diagram);

			expect(result.edges.edge1.anchors[0].x).toBe(100);
			expect(result.edges.edge2.anchors[0].x).toBe(250);
		});
	});

	describe("error handling", () => {
		it("should throw error for invalid resize orientation", () => {
			const node = createNode({ id: "node1", x: 100, y: 100, width: 100, height: 100 });
			const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
			const vector = { x: 20, y: 15 };

			expect(() => resizeElement("node1", "invalid" as "top-left", vector, diagram)).toThrow(
				"Unknown resize orientation invalid"
			);
		});

		it("should handle non-existent elements gracefully", () => {
			const diagram = createDiagramState({
				diagram: { nodes: {}, containers: {} }
			}).diagram;
			const vector = { x: 20, y: 15 };

			expect(() => resizeElement("nonexistent", "bottom-right", vector, diagram)).toThrow();
		});
	});

	describe("edge cases", () => {
		it("should handle zero vector resize", () => {
			const node = createNode({ id: "node1", x: 100, y: 100, width: 100, height: 100 });
			const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
			const vector = { x: 0, y: 0 };

			const result = resizeElement("node1", "bottom-right", vector, diagram);

			expect(result.nodes.node1).toEqual(node);
		});

		it("should handle negative resize vectors correctly", () => {
			const node = createNode({ id: "node1", x: 100, y: 100, width: 100, height: 100 });
			const diagram = createDiagramState({ diagram: { nodes: { node1: node } } }).diagram;
			const vector = { x: -20, y: -15 };

			const result = resizeElement("node1", "bottom-right", vector, diagram);

			expect(result.nodes.node1.width).toBe(80);
			expect(result.nodes.node1.height).toBe(85);
		});
	});
});
