// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
const path = require('path')
const webpackConfig = require('@nextcloud/webpack-vue-config')
const webpack = require('webpack')

webpackConfig.entry.settings = path.resolve(path.join('src', 'settings.js'))
webpackConfig.entry.editor = path.resolve(path.join('src', 'editor.js'))

module.exports = webpackConfig
