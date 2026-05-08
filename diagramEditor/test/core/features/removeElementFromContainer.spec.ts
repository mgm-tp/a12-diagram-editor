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



import {
	removeElementFromContainer,
	canRemoveElementFromContainer
} from "../../../src/core/features/removeElementFromContainer";
import { createDiagramState, createNode, createConnectedEdge } from "../../utils/diagramStateHelper";
import { createDiagramContainer } from "../../../src/core/diagram/container";

describe("removeElementFromContainer", () => {
	describe("removing nodes from containers", () => {
		it("should remove a node from a container", () => {
			const node1 = createNode({ id: "node1" });
			const node2 = createNode({ id: "node2" });
			const container = createDiagramContainer({ id: "container1", children: ["node1", "node2"] });
			const diagram = createDiagramState({
				diagram: { nodes: { node1, node2 }, containers: { container1: container } }
			}).diagram;

			const result = removeElementFromContainer("node1", "container1", diagram);

			expect(result.containers.container1.children).toEqual(["node2"]);
		});

		it("should remove the last node from a container", () => {
			const node1 = createNode({ id: "node1" });
			const container = createDiagramContainer({ id: "container1", children: ["node1"] });
			const diagram = createDiagramState({
				diagram: { nodes: { node1 }, containers: { container1: container } }
			}).diagram;

			const result = removeElementFromContainer("node1", "container1", diagram);

			expect(result.containers.container1.children).toEqual([]);
		});

		it("should handle removing non-existent elements gracefully", () => {
			const node1 = createNode({ id: "node1" });
			const container = createDiagramContainer({ id: "container1", children: ["node1"] });
			const diagram = createDiagramState({
				diagram: { nodes: { node1 }, containers: { container1: container } }
			}).diagram;

			const result = removeElementFromContainer("nonexistent", "container1", diagram);

			expect(result.containers.container1.children).toEqual(["node1"]);
		});
	});

	describe("removing containers from containers", () => {
		it("should remove a nested container from its parent", () => {
			const subContainer = createDiagramContainer({ id: "subContainer" });
			const parentContainer = createDiagramContainer({ id: "container1", children: ["subContainer"] });
			const diagram = createDiagramState({
				diagram: { containers: { container1: parentContainer, subContainer } }
			}).diagram;

			const result = removeElementFromContainer("subContainer", "container1", diagram);

			expect(result.containers.container1.children).toEqual([]);
		});
	});

	describe("automatic edge removal", () => {
		it("should remove edges when one endpoint is removed from container", () => {
			const node1 = createNode({ id: "node1" });
			const node2 = createNode({ id: "node2" });
			const edge1 = createConnectedEdge({ id: "edge1", sourceNodeId: "node1", targetNodeId: "node2" });
			const container = createDiagramContainer({ id: "container1", children: ["node1", "node2", "edge1"] });
			const diagram = createDiagramState({
				diagram: { nodes: { node1, node2 }, edges: { edge1 }, containers: { container1: container } }
			}).diagram;

			const result = removeElementFromContainer("node1", "container1", diagram);

			expect(result.containers.container1.children).toEqual(["node2"]);
			expect(result.containers.container1.children).not.toContain("edge1");
		});

		it("should keep edges when both endpoints remain in container", () => {
			const node1 = createNode({ id: "node1" });
			const node2 = createNode({ id: "node2" });
			const node3 = createNode({ id: "node3" });
			const edge1 = createConnectedEdge({ id: "edge1", sourceNodeId: "node1", targetNodeId: "node2" });
			const container = createDiagramContainer({ id: "container1", children: ["node1", "node2", "node3", "edge1"] });
			const diagram = createDiagramState({
				diagram: { nodes: { node1, node2, node3 }, edges: { edge1 }, containers: { container1: container } }
			}).diagram;

			const result = removeElementFromContainer("node3", "container1", diagram);

			expect(result.containers.container1.children).toContain("node1");
			expect(result.containers.container1.children).toContain("node2");
			expect(result.containers.container1.children).toContain("edge1");
			expect(result.containers.container1.children).not.toContain("node3");
		});

		it("should remove multiple edges when their endpoints are removed", () => {
			const node1 = createNode({ id: "node1" });
			const node2 = createNode({ id: "node2" });
			const node3 = createNode({ id: "node3" });
			const edge1 = createConnectedEdge({ id: "edge1", sourceNodeId: "node1", targetNodeId: "node2" });
			const edge2 = createConnectedEdge({ id: "edge2", sourceNodeId: "node1", targetNodeId: "node3" });
			const container = createDiagramContainer({
				id: "container1",
				children: ["node1", "node2", "node3", "edge1", "edge2"]
			});
			const diagram = createDiagramState({
				diagram: { nodes: { node1, node2, node3 }, edges: { edge1, edge2 }, containers: { container1: container } }
			}).diagram;

			const result = removeElementFromContainer("node1", "container1", diagram);

			expect(result.containers.container1.children).toContain("node2");
			expect(result.containers.container1.children).toContain("node3");
			expect(result.containers.container1.children).not.toContain("edge1");
			expect(result.containers.container1.children).not.toContain("edge2");
			expect(result.containers.container1.children).not.toContain("node1");
		});
	});

	describe("edge cases", () => {
		it("should handle empty containers", () => {
			const container = createDiagramContainer({ id: "container1", children: [] });
			const diagram = createDiagramState({ diagram: { containers: { container1: container } } }).diagram;

			const result = removeElementFromContainer("nonexistent", "container1", diagram);

			expect(result.containers.container1.children).toEqual([]);
		});

		it("should preserve container order for remaining elements", () => {
			const node1 = createNode({ id: "node1" });
			const node2 = createNode({ id: "node2" });
			const node3 = createNode({ id: "node3" });
			const container = createDiagramContainer({ id: "container1", children: ["node1", "node2", "node3"] });
			const diagram = createDiagramState({
				diagram: { nodes: { node1, node2, node3 }, containers: { container1: container } }
			}).diagram;

			const result = removeElementFromContainer("node2", "container1", diagram);

			expect(result.containers.container1.children).toEqual(["node1", "node3"]);
		});
	});
});

describe("canRemoveElementFromContainer", () => {
	it("should return true when container is not readonly", () => {
		const readonlyElements = {};
		const result = canRemoveElementFromContainer("container1", readonlyElements);

		expect(result).toBe(true);
	});

	it("should return false when container is readonly", () => {
		const readonlyElements = { container1: true };
		const result = canRemoveElementFromContainer("container1", readonlyElements);

		expect(result).toBe(false);
	});

	it("should return true for different container when target is not readonly", () => {
		const readonlyElements = { container2: true };
		const result = canRemoveElementFromContainer("container1", readonlyElements);

		expect(result).toBe(true);
	});

	it("should return true for empty readonly elements", () => {
		const readonlyElements = {};
		const result = canRemoveElementFromContainer("container1", readonlyElements);

		expect(result).toBe(true);
	});
});
