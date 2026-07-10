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

import { Provider } from "react-redux";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import { devToolsEnhancer } from "@redux-devtools/extension";
import { compose } from "@reduxjs/toolkit";

import type { ApplicationSetup } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ApplicationFactories, FrameFactories } from "@com.mgmtp.a12.client/client-core";
import { createHttpModelLoader } from "@com.mgmtp.a12.client/client-core/modelLoader";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import type { Locale } from "@com.mgmtp.a12.utils/utils-localization";
import {
	defaultDataFormats,
	defaultValueConversion,
	defaultLocalizerFactory
} from "@com.mgmtp.a12.utils/utils-localization";
import { shouldForwardProp, GlobalStyles, flatCompactTheme } from "@com.mgmtp.a12.widgets/widgets-core";
import { diagramBlacklistedActions } from "@com.mgmtp.a12.diagrameditor/diagrameditor";

import { BasicDiagramView } from "../examples/basic/basicView";
import { appModel } from "../appModel";
import { basicDataProvider } from "../examples/basic/basicDataProvider";
import { basicDiagramActivityReducer } from "../examples/basic/basicReducer";
import { EmptyDiagramView } from "../examples/empty/emptyView";
import { emptyDataProvider } from "../examples/empty/emptyDataProvider";
import { emptyDiagramActivityReducer } from "../examples/empty/emptyReducer";
import { PerformanceDiagramView } from "../examples/performance/performanceView";
import { performanceDiagramActivityReducer } from "../examples/performance/performanceReducer";
import { performanceDataProvider } from "../examples/performance/performanceDataProvider";

import { SideBarView } from "./sidebar";

const RegionUI = FrameFactories.regionUiProvider([]);
const progressComponentProvider = FrameFactories.createProgressComponentProvider();

interface AppProps {
	setup: ApplicationSetup;
}

export function App(props: AppProps) {
	const locale: Locale = { country: "US", language: "en" };
	const dataFormats = defaultDataFormats(locale);
	const conversion = defaultValueConversion(dataFormats);
	const localizer = defaultLocalizerFactory({
		locale,
		conversion,
		dataFormats,
		translationSource: { en_US: { application: { title: "Diagram Editor Showcase" } } }
	});

	return (
		<Provider store={props.setup.store}>
			<LocalizerContext.Provider value={{ locale, dataFormats, localizer, conversion }}>
				<StyleSheetManager shouldForwardProp={shouldForwardProp}>
					<ThemeProvider theme={flatCompactTheme}>
						<GlobalStyles />
						<RegionUI
							regionReference={[]}
							viewProvider={viewProvider}
							regionUiProvider={FrameFactories.regionUiProvider}
							progressComponentProvider={progressComponentProvider}
							layoutProvider={FrameFactories.layoutProvider}
						/>
					</ThemeProvider>
				</StyleSheetManager>
			</LocalizerContext.Provider>
		</Provider>
	);
}

function viewProvider(name: string) {
	if (name === "BasicDiagramView") {
		return BasicDiagramView;
	} else if (name === "EmptyDiagramView") {
		return EmptyDiagramView;
	} else if (name === "PerformanceDiagramView") {
		return PerformanceDiagramView;
	} else if (name === "SidebarView") {
		return SideBarView;
	}
	const view = FrameFactories.viewProvider(name);
	if (!view) {
		throw new Error(`No view registered for: ${name}`);
	}
	return view;
}

export function appSetup() {
	return ApplicationFactories.createApplicationSetup({
		dataHandlers: [basicDataProvider, emptyDataProvider, performanceDataProvider],
		modelLoader: createHttpModelLoader(),
		model: appModel,
		dataReducers: [basicDiagramActivityReducer, emptyDiagramActivityReducer, performanceDiagramActivityReducer],
		setupActions: [
			ActivityActions.create({ activityDescriptor: { diagram: "basic" }, loadingState: "missing" }),
			ActivityActions.create({ activityDescriptor: { view: "sidebar" }, loadingState: "without" })
		],
		composeEnhancer(enhancers) {
			return compose(enhancers, devToolsEnhancer({ actionsDenylist: diagramBlacklistedActions }));
		}
	});
}
