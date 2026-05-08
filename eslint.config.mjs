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

import { readFile } from "node:fs/promises";

import prettierPlugin from "eslint-config-prettier";
import notice from "eslint-plugin-notice";
import chaiFriendly from "eslint-plugin-chai-friendly";

import { reactStrict } from "@com.mgmtp.a12.devtools/eslint-config";

const template = (await readFile(`${import.meta.dirname}/buildScript/license/dual-license.txt`, "utf-8")).trimEnd();
const devAppTemplate = (
	await readFile(`${import.meta.dirname}/buildScript/license/dual-license.txt`, "utf-8")
).trimEnd();

/** @type { import("eslint").Linter.Config[] } */
export default [
	...reactStrict,
	prettierPlugin,
	{
		name: "common",
		files: ["**/*.ts", "**/*.tsx", ".prettierrc.mjs", "eslint.config.mjs"],
		plugins: {
			"chai-friendly": chaiFriendly
		},
		languageOptions: {
			parserOptions: {
				projectService: { allowDefaultProject: [".prettierrc.mjs", "eslint.config.mjs"] }
			}
		},
		rules: {
			// Modified severity or config
			"@/object-curly-spacing": ["error", "always"],
			"@typescript-eslint/no-dynamic-delete": "warn",
			"@typescript-eslint/no-empty-object-type": "warn",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-invalid-void-type": "warn",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unsafe-function-type": "warn",
			"@typescript-eslint/no-unused-vars": ["error", { vars: "all", args: "none", ignoreRestSiblings: true }],
			"@typescript-eslint/no-unused-expressions": "off", // disable original rule
			"chai-friendly/no-unused-expressions": "error",
			"@typescript-eslint/no-wrapper-object-types": "warn",
			"react/display-name": "warn",
			"react/react-in-jsx-scope": "off",
			"react-hooks/rules-of-hooks": "warn",
			"no-inner-declarations": "warn",
			"no-param-reassign": "error",
			curly: "error"
		}
	},
	{
		name: "ignore built files",
		ignores: ["node_modules", "build", "dist", "**/*.js", "**/*.d.ts"]
	},
	{
		name: "diagram-editor",
		plugins: { notice },
		files: ["diagramEditor/**/*.ts", "diagramEditor/**/*.tsx", ".prettierrc.mjs", "eslint.config.mjs"],
		rules: {
			"notice/notice": ["error", { template, onNonMatchingHeader: "replace", chars: template.length }]
		}
	},
	{
		name: "devApp",
		plugins: { notice },
		files: ["devApp/**/*.ts", "devApp/**/*.tsx"],
		rules: {
			"notice/notice": [
				"error",
				{ template: devAppTemplate, onNonMatchingHeader: "replace", chars: devAppTemplate.length }
			]
		}
	},
	{
		name: "codemod",
		plugins: { notice },
		files: ["codemod/**/*.ts", "codemod/**/*.tsx"],
		rules: {
			"notice/notice": ["error", { template, onNonMatchingHeader: "replace", chars: template.length }]
		}
	},
	{
		name: "codemod-cli-exception",
		files: ["codemod/src/cli.ts"],
		rules: {
			"notice/notice": "off"
		}
	}
];
