// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later
const path = require('path')
const webpackConfig = require('@nextcloud/webpack-vue-config')
const webpack = require('webpack')

webpackConfig.entry.settings = path.resolve(path.join('src', 'settings.js'))
webpackConfig.entry.editor = path.resolve(path.join('src', 'editor.js'))
webpackConfig.entry['public'] = path.resolve(path.join('src', 'public.js'))

webpackConfig.module.rules = [  // taken from https://github.com/nextcloud-libraries/webpack-vue-config/blob/main/rules.js and modified to `source` SVGs
	{
		test: /\.css$/,
		use: ['style-loader', 'css-loader'],
	},
	{
		test: /\.scss$/,
		use: ['style-loader', 'css-loader', 'sass-loader'],
	},
	{
		test: /\.vue$/,
		loader: 'vue-loader',
	},
	{
		test: /\.js$/,
		loader: 'babel-loader',
		exclude: /node_modules/,
	},
	{
		test: /\.tsx?$/,
		use: [
			'babel-loader',
			'ts-loader',
		],
		exclude: /node_modules/,
	},
	{
		test: /\.(png|jpe?g|gif|woff2?|eot|ttf)$/,
		type: 'asset/inline',
	},
	{
		test: /\.svg$/,
		type: 'asset/source',
	},
];

module.exports = webpackConfig
