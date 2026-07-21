// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getRequestToken } from '@nextcloud/auth'
import { getFilePickerBuilder } from '@nextcloud/dialogs'
import { defaultRootPath, getClient } from '@nextcloud/files/dav'
import { generateFilePath, generateUrl } from '@nextcloud/router'
import { saveFileContent } from './utils.js'

import '@nextcloud/dialogs/style.css'  // eslint-disable-line

__webpack_nonce__ = btoa(getRequestToken())
__webpack_public_path__ = generateFilePath('openincryptpad', '', 'js/') // eslint-disable-line

/* global CryptPadAPI */

let wantReload = false
let hasUnsavedChanges = false

window.addEventListener('DOMContentLoaded', async function() {
	try {
		if (!window.CryptPadAPI) {
			showError('The CryptPad instance is not configured correctly. Please contact your admin.')
			return
		}

		const {
			fileId,
			filePath,
			mimeType,
			fileType,
			app,
			cryptPadUrl,
			sharedWithLink,
			fileName,
		} = window.OpenInCryptPadInfo

		let blob
		let token
		document.title = fileName + ' - Nextcloud'

		if (sharedWithLink) {
			token = new URL(filePath).pathname.split('/').at(-1)
			blob = await loadFileContentShared(filePath)
		} else {
			blob = await loadFileContent(filePath, mimeType)
		}

		let viewOnlyMode = false
		const sessionKey = await getSessionForFile(fileId, token)
		if (!sessionKey) {
			viewOnlyMode = true
		}

		const docUrl = URL.createObjectURL(blob)

		const events = viewOnlyMode
			? {
					onSave: () => null,
					onHasUnsavedChanges: () => null,
					onInsertImage,
				}
			: {
					onSave: (data, cb) => onSave(filePath, data).then(cb),
					onHasUnsavedChanges,
					onInsertImage,
				}

		CryptPadAPI(cryptPadUrl, 'editor-content', {
			document: {
				url: docUrl,
				key: sessionKey,
				fileType,
			},
			documentType: app,
			mode: viewOnlyMode ? 'view' : '',
			events,
			width: '100%',
			height: '100%',
		})

		if (!viewOnlyMode) {
			waitForSessionChange(fileId, token, sessionKey).then(resetCryptPadSession)
		}
		initBackButton()
	} catch (e) {
		console.error(e) // eslint-disable-line no-console
		showError('Error while opening file')
	}
})

/**
 *
 */
function initBackButton() {
	const backButton = document.querySelector('#back-button')
	backButton.setAttribute('href', getBackURL())
}

/**
 *
 */
function getBackURL() {
	const params = new URLSearchParams(location.search)
	return params.get('back')
}

/**
 * @typedef InsertImageCallbackParam
 * @type {object}
 * @property {Blob} blog - the image as Blob.
 */

/**
 * @callback InsertImageCallback
 * @param {InsertImageCallbackParam} param - the image
 */

/**
 *
 * @param {object} data unused for now
 * @param {InsertImageCallback} callback called with the selected image as blob
 */
async function onInsertImage(data, callback) {
	const filepicker = getFilePickerBuilder(t('openincryptpad', 'Pick an image'))
		.addMimeTypeFilter('image/*')
		.addButton({
			label: t('openincryptpad', 'Choose image'),
			callback: () => null,
		})
		.build()

	const path = await filepicker.pick()
	const fileClient = getClient()
	const blob = await getImage(fileClient.getFileDownloadLink(`${defaultRootPath}${path}`))

	callback({ blob })
}

/**
 *
 * @param {string} message the message to show
 */
function showError(message) {
	document.querySelector('#error-indicator').innerText = t('openincryptpad', message)
	document.querySelector('#error-indicator').className = 'visible'
}

/**
 *
 */
function resetCryptPadSession() {
	if (hasUnsavedChanges) {
		wantReload = true
	} else {
		document.location.reload()
	}
}

/**
 *
 * @param {string} fileId the path to check
 * @param {?string} token the token of a public-share link, if there is one
 * @param {string} sessionKey the current sessionKey
 */
async function waitForSessionChange(fileId, token, sessionKey) {
	while (true) {
		await delay(10 * 1000)
		const nextSessionKey = await getSessionForFile(fileId, token)
		if (!nextSessionKey) {
			window.location.href = getBackURL()
		}
		if (sessionKey !== nextSessionKey) {
			return
		}
	}
}

/**
 *
 * @param {number} ms delay in ms
 */
function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

/**
 *
 * @param {string} filePath the file path
 * @param {string} mimeType the mime type
 */
async function loadFileContent(filePath, mimeType) {
	const fileClient = getClient()
	const contents = await fileClient.getFileContents(`${defaultRootPath}${filePath}`)
	const blob = new Blob([contents], {
		type: mimeType,
	})

	return blob
}

/**
 *
 * @param {string} downloadPath the download path for the file
 */
async function loadFileContentShared(downloadPath) {
	try {
		const response = await fetch(downloadPath)
		if (!response.ok) {
			throw new Error(`Failed to fetch file: ${response.statusText}`)
		}
		const blob = await response.blob()

		return blob
	} catch (e) {
		console.log('Can not load file content', e) // eslint-disable-line no-console
		throw e
	}
}

/**
 *
 * @param {string} filePath the file path
 * @param {Blob} data the data to dave
 */
async function onSave(filePath, data) {
	try {
		await saveFileContent(filePath, data)
	} catch (e) {
		console.error('Could not save', e) // eslint-disable-line no-console
		document.location.reload()
	}
}

/**
 *
 * @param {boolean} unsavedChanges - does the document has unsaved changes?
 */
function onHasUnsavedChanges(unsavedChanges) {
	hasUnsavedChanges = unsavedChanges
	const elem = document.querySelector('#unsaved-indicator')
	elem.className = unsavedChanges ? 'visible' : ''

	if (!unsavedChanges && wantReload) {
		document.location.reload()
	}
}

/**
 *
 * @param {string} fileId the id of the file
 * @param {?token} token the token of the public-share link, if there is one
 */
async function getSessionForFile(fileId, token = null) {
	const params = new URLSearchParams()
	if (token) {
		params.append('token', token)
	}
	const response = await fetch(
		generateUrl(`/apps/openincryptpad/session/${fileId}?${params.toString()}`),
		{
			headers: {
				requesttoken: OC.requestToken,
			},
		},
	)
	if (response.ok) {
		const body = await response.json()
		return body.sessionKey
	} else {
		return null
	}
}

/**
 *
 * @param { string } imageUrl the link to the image
 */
async function getImage(imageUrl) {
	const myRequest = new Request(imageUrl)

	const response = await fetch(myRequest)
	const blob = await response.blob()

	return blob
}
