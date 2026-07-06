// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getClient, defaultRootPath, getDefaultPropfind, resultToNode } from '@nextcloud/files/dav'

/**
 *
 * @param {string} path the file path
 * @param {Blob} data the data to save
 */
export async function saveFileContent(path, data) {
	const fileClient = getClient()
  const body = data instanceof Blob ? await data.arrayBuffer() : data
	await fileClient.putFileContents(
		`${defaultRootPath}${path}`,
		body,
	)
}

/**
 *
 * @param {string} path the file path
 */
export async function getFileInfo(path) {
	const fileClient = getClient()
	const result = await fileClient.stat(`${defaultRootPath}${path}`, {
		details: true,
		data: getDefaultPropfind(),
	})
	const node = resultToNode(result.data);
	console.log('XXX stat', JSON.stringify(node));
	return node
}
