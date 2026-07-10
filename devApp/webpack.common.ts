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

import * as Path from "path";

import TerserPlugin from "terser-webpack-plugin";
import type * as Webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const commonConfig: Webpack.Configuration = {
	optimization: {
		minimizer: [new TerserPlugin({ minify: TerserPlugin.esbuildMinify })],
		moduleIds: "deterministic",
		runtimeChunk: "single",
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				defaultVendors: {
					name: "vendors",
					test: /[\\/]node_modules[\\/]/,
					priority: -10
				}
			}
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			minify: true,
			inject: true,
			template: "public/index.html"
		}),
		// minify
		new MiniCssExtractPlugin({
			filename: "[name].bundle.[contenthash:8].css"
		})
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "esbuild-loader",
				options: {
					loader: "tsx",
					target: "ES2020"
				}
			},
			{
				test: /.svg?$/,
				loader: "@svgr/webpack",
				options: {
					svgo: false
				}
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"]
			},
			{
				test: /\.(png|jpe?g|gif|svg|woff|woff2)$/i,
				// More information here https://webpack.js.org/guides/asset-modules/
				dependency: "./node_modules/@com.mgmtp.a12.widgets/widgets-core/lib/theme/fonts",
				type: "asset/resource",
				generator: {
					filename: "static/media/[hash][ext][query]"
				}
			}
		]
	},
	entry: ["./src/index.tsx", "@com.mgmtp.a12.widgets/widgets-core/styles/basic.css"],
	resolve: {
		extensions: [".js", ".ts", ".tsx"],
		alias: {
			react: Path.join(__dirname, "node_modules", "react"),
			"react-dom": Path.join(__dirname, "node_modules", "react-dom"),
			"react-redux": Path.join(__dirname, "node_modules", "react-redux"),
			"styled-components": Path.join(__dirname, "node_modules", "styled-components")
		}
	}
};

export default commonConfig;
