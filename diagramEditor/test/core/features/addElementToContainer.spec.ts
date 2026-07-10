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

import { addElementToContainer, canAddElementToContainer } from "../../../src/core/features/addElementToContainer";
import { createDiagramState, createNode, createConnectedEdge } from "../../utils/diagramStateHelper";
import { createDiagramContainer } from "../../../src/core/diagram/container";

describe("addElementToContainer", () => {
	describe("adding nodes to containers", () => {
		it("should add a node to an empty container", () => {
			const result = addElementToContainer("node1", "container1", diagram);

			expect(result.containers.container1.children).toEqual(["node1"]);
		});

		it("should add a node to a container with existing children", () => {
			const containerWithChildren = createDiagramContainer({ id: "container1", children: ["existingNode"] });
			const diagramWithExistingChildren = createDiagramState({
				diagram: {
					nodes: { node1, existingNode: createNode({ id: "existingNode" }) },
					containers: { container1: containerWithChildren }
				}
			}).diagram;

			const result = addElementToContainer("node1", "container1", diagramWithExistingChildren);

			expect(result.containers.container1.children).toContain("node1");
			expect(result.containers.container1.children).toContain("existingNode");
			expect(result.containers.container1.children).toHaveLength(2);
		});

		it("should not add duplicate nodes", () => {
			const containerWithNode = createDiagramContainer({ id: "container1", children: ["node1"] });
			const diagramWithNode = createDiagramState({
				diagram: { nodes: { node1 }, containers: { container1: containerWithNode } }
			}).diagram;

			const result = addElementToContainer("node1", "container1", diagramWithNode);

			expect(result.containers.container1.children).toEqual(["node1"]);
		});
	});

	describe("adding containers to containers", () => {
		it("should add a container to another container", () => {
			const subContainer = createDiagramContainer({ id: "subContainer" });
			const diagramWithSubContainer = createDiagramState({
				diagram: { containers: { container1, subContainer } }
			}).diagram;

			const result = addElementToContainer("subContainer", "container1", diagramWithSubContainer);

			expect(result.containers.container1.children).toEqual(["subContainer"]);
		});
	});

	describe("automatic edge inclusion", () => {
		it("should include connected edges when both endpoints are in container", () => {
			const diagramWithEdge = createDiagramState({
				diagram: { nodes: { node1, node2 }, edges: { edge1 }, containers: { container1 } }
			}).diagram;

			let result = addElementToContainer("node1", "container1", diagramWithEdge);
			result = addElementToContainer("node2", "container1", result);

			expect(result.containers.container1.children).toContain("node1");
			expect(result.containers.container1.children).toContain("node2");
			expect(result.containers.container1.children).toContain("edge1");
		});

		it("should not include edges when only one endpoint is in container", () => {
			const diagramWithEdge = createDiagramState({
				diagram: { nodes: { node1, node2 }, edges: { edge1 }, containers: { container1 } }
			}).diagram;

			const result = addElementToContainer("node1", "container1", diagramWithEdge);

			expect(result.containers.container1.children).toContain("node1");
			expect(result.containers.container1.children).not.toContain("edge1");
		});

		it("should include multiple connected edges", () => {
			const edge2 = createConnectedEdge({ id: "edge2", sourceNodeId: "node1", targetNodeId: "node3" });
			const node3 = createNode({ id: "node3" });

			const diagramWithMultipleEdges = createDiagramState({
				diagram: { nodes: { node1, node2, node3 }, edges: { edge1, edge2 }, containers: { container1 } }
			}).diagram;

			let result = addElementToContainer("node1", "container1", diagramWithMultipleEdges);
			result = addElementToContainer("node2", "container1", result);
			result = addElementToContainer("node3", "container1", result);

			expect(result.containers.container1.children).toContain("edge1");
			expect(result.containers.container1.children).toContain("edge2");
		});
	});

	describe("error handling", () => {
		it("should throw when trying to add non-existent elements", () => {
			expect(() => addElementToContainer("nonexistent", "container1", diagram)).toThrow();
		});

		it("should handle non-existent containers", () => {
			expect(() => addElementToContainer("node1", "nonexistent", diagram)).toThrow();
		});
	});
});

describe("canAddElementToContainer", () => {
	it("should return true when container is not readonly", () => {
		const readOnlyElements = {};
		const result = canAddElementToContainer(node1.id, container1.id, readOnlyElements, diagram);
		expect(result).toBe(true);
	});

	it("should return false when container is readonly", () => {
		const readOnlyElements = { container1: true };
		const result = canAddElementToContainer(node1.id, container1.id, readOnlyElements, diagram);
		expect(result).toBe(false);
	});

	it("should return true for different container when target is not readonly", () => {
		const readOnlyElements = { container2: true };
		const result = canAddElementToContainer(node1.id, container1.id, readOnlyElements, diagram);
		expect(result).toBe(true);
	});

	it("should return true for empty readonly elements", () => {
		const readOnlyElements = {};
		const result = canAddElementToContainer(node1.id, container1.id, readOnlyElements, diagram);
		expect(result).toBe(true);
	});

	it("should return false if a cycle is created", () => {
		const readOnlyElements = {};
		const result = canAddElementToContainer(container2.id, container1.id, readOnlyElements, diagram);
		expect(result).toBe(false);
	});
});

const node1 = createNode({ id: "node1", x: 100, y: 100 });
const node2 = createNode({ id: "node2", x: 200, y: 200 });
const edge1 = createConnectedEdge({ id: "edge1", sourceNodeId: "node1", targetNodeId: "node2" });
const container1 = createDiagramContainer({ id: "container1", children: [] });
const container2 = createDiagramContainer({ id: "container2", children: [container1.id] });

const diagram = createDiagramState({
	diagram: { nodes: { node1, node2 }, edges: { edge1 }, containers: { container1, container2 } }
}).diagram;
