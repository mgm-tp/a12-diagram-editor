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

import type { PathLike } from "fs";
import { existsSync, rmdir } from "fs";

import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";
import webpackPreprocessor from "@cypress/webpack-preprocessor";

import config from "./webpack.cypress";

export const commonCypressConfig: Cypress.ConfigOptions = {
	projectId: "DE_dev_app",
	viewportWidth: 1920,
	viewportHeight: 1080,
	watchForFileChanges: false,
	video: false,
	screenshotOnRunFailure: false,
	fixturesFolder: false,
	waitForAnimations: true,
	retries: { runMode: 1, openMode: 0 },
	trashAssetsBeforeRuns: true
};

export const commonE2EConfig: Cypress.CoreConfigOptions = {
	supportFile: "cypress/support/e2e.ts",
	setupNodeEvents(on) {
		on("file:preprocessor", webpackPreprocessor({ webpackOptions: config }));
		installLogsPrinter(on, { printLogsToConsole: "onFail" });
		on("task", {
			deleteFolder(folderName: PathLike) {
				return new Promise((resolve, reject) => {
					if (existsSync(folderName)) {
						console.log("deleting folder %s", folderName);
						rmdir(folderName, { maxRetries: 10, recursive: true }, err => {
							if (err) {
								console.error(err);
								return reject(err);
							}
						});
					}
					resolve(null);
				});
			}
		});
	},
	trashAssetsBeforeRuns: true,
	specPattern: "cypress/e2e/test*.*",
	testIsolation: false,
	chromeWebSecurity: false
};
