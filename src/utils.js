// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defaultRootPath, getClient, getDefaultPropfind, resultToNode } from '@nextcloud/files/dav'
import { generateUrl } from '@nextcloud/router'

/**
 *
 * @param {string} path the file path
 * @param {Blob} data the data to save
 */
export async function saveFileContent(path, data) {
	if (path.startsWith('http')) {
		// This is a publik-link share. Just upload, using the link.
		await upload(path, data)
	} else {
		// Use DAV for logged in users
		const fileClient = getClient()
		const body = data instanceof Blob ? await data.arrayBuffer() : data
		await fileClient.putFileContents(`${defaultRootPath}${path}`, body)
	}
}

/**
 *
 * @param {string} url the url
 * @param {Blob} data the data to save
 */
async function upload(url, data) {
	const response = await fetch(url, {
		method: 'PUT',
		body: data,
	})
	if (!response.ok) {
		throw new Error(`Failed to save file: ${response.statusText}`)
	}
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
	const node = resultToNode(result.data)
	return node
}

/**
 *
 * @param {string} fileId Nextcloud ID of the file
 * @param {string} filePath path to the file
 * @param {string} mimeType the mime type of the file
 * @param {string} backLink the URL back to Nextcloud
 * @param {boolean|string} viewOnly what kind of share
 * @param {boolean|string} sharedWithLink is this a public-share link?
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
