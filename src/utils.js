// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { generateUrl } from '@nextcloud/router'
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
	return node
}

/**
 *
 * @param {string} fileId Nextcloud ID of the file
 * @param {string} filePath path to the file
 * @param {string} mimeType the mime type of the file
 * @param {string} backLink the URL back to Nextcloud
 * @param {string} viewOnly what kind of share
 * @param {string} fileName the file name
 */
export function openInCryptPad(fileId, filePath, mimeType, backLink, viewOnly, sharedWithLink, fileName) {
	location.href = generateUrl('/apps/openincryptpad/editor?id={id}&path={path}&mimeType={mimeType}&back={back}&viewOnly={viewOnly}&sharedWithLink={sharedWithLink}&fileName={fileName}', {
		id: fileId,
		path: filePath,
		mimeType,
		back: backLink,
		viewOnly: !viewOnly || viewOnly === 'false' ? 'false' : 'true',
		sharedWithLink: !sharedWithLink || sharedWithLink === 'false' ? 'false' : 'true',
		fileName,
	})
}

