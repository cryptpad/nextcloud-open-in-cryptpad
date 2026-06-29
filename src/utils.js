// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getClient } from '@nextcloud/files/dav'

/**
 *
 * @param {string} path the file path
 * @param {Blob} data the data to dave
 */
export async function saveFileContent(path, data) {
	const fileClient = getClient()
	await fileClient.putFileContents(
		path,
		data,
		{ overwrite: false }, // Bug in NextCloud? This has to be set to false to make the upload work.
	)
}

/**
 *
 * @param {string} path the file path
 */
export async function getFileInfo(path) {
	const fileClient = getClient()
	const result = await fileClient.stat(path)
	return result
}
