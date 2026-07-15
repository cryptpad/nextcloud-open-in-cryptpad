// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { generateUrl, generateOcsUrl, generateFilePath } from '@nextcloud/router'
import { getFilePickerBuilder } from '@nextcloud/dialogs'
import { getClient, defaultRootPath } from '@nextcloud/files/dav'
import { saveFileContent } from './utils.js'
import { getRequestToken } from '@nextcloud/auth'

import '@nextcloud/dialogs/style.css'  // eslint-disable-line

__webpack_nonce__ = btoa(getRequestToken()) // eslint-disable-line
__webpack_public_path__ = generateFilePath('openincryptpad', '', 'js/') // eslint-disable-line

/* global CryptPadAPI */

let cryptPadSession = null
let wantReload = false;
let hasUnsavedChanges = false;

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
			isShared,
			fileName,
		} = window.OpenInCryptPadInfo

		let blob
		let viewMode = ''
		document.title = fileName + ' - Nextcloud'
		// if opening file from a share link, we don't get access to the file path, but we can download it
		if (isShared.startsWith('true')) {
			viewMode = 'view'
		}

		if (isShared.includes('External')) {
			blob = await loadFileContentShared(filePath, mimeType)
		} else {
			blob = await loadFileContent(filePath, mimeType)
		}

		let viewOnlyMode = false
		let sessionKey
		try {
			sessionKey = await getSessionForFile(fileId)
		} catch (e) {
			viewOnlyMode = true
		}

		const docUrl = URL.createObjectURL(blob)

		const events = viewOnlyMode
			? {
				onSave: (data, cb) => null,
				// onNewKey: (data, cb) => cb(data.new), // Just accept and ignore any session key CryptPad wants to use
				onHasUnsavedChanges: (unsavedChanges) => null,
				onInsertImage,
			}
			: {
				onSave: (data, cb) => onSave(filePath, data, cb, isShared),
				// onNewKey: (data, cb) => updateSessionForFile(fileId, data, cb),
				onHasUnsavedChanges: onHasUnsavedChanges,
				onInsertImage,
			}

		CryptPadAPI(cryptPadUrl, 'editor-content', {
			document: {
				url: docUrl,
				key: sessionKey,
				fileType,
			},
			documentType: app,
			mode: viewMode,
			events,
			width: '100%',
			height: '100%',
		})

		if (isShared !== 'trueExternal') {
			checkForSessionChange(fileId, sessionKey, () => resetCryptPadSession())
		}
		initBackButton()

	} catch (e) {
		console.error(e)
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

function getBackURL() {
	const params = new URLSearchParams(location.search)
	return params.get('back')
}

/**
 *
 * @param {object} data unused for now
 * @param {Function} callback called with the selected image as blob
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

	callback({ blob }) // eslint-disable-line n/no-callback-literal
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
		wantReload = true;
	} else {
		document.location.reload()
	}
}

/**
 *
 * @param {string} fileId the path to check
 * @param {Function} cb called, when the permissions change
 */
async function checkForSessionChange(fileId, sessionKey, cb) {
	while (true) {
		await delay(10 * 1000)
		const nextSessionKey = await getSessionForFile(fileId)
		if (!nextSessionKey) {
			window.location.href = getBackURL()
		}
		if (sessionKey !== nextSessionKey) {
			sessionKey = nextSessionKey
			cb()
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
 * @param {object} a share
 * @returns true, if the user this file is shared with, can edit it
 */
function canEdit(share) {
	const PERM = {
		READ: 1, UPDATE: 2, CREATE: 4, DELETE: 8, SHARE: 16, ALL: 31,
	};

	return (share.permissions & PERM.UPDATE) === PERM.UPDATE;
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
 * @param {string} mimeType the mime type
 */
async function loadFileContentShared(downloadPath, mimeType) {
	try {
		const response = await fetch(downloadPath)
		if (!response.ok) {
			throw new Error(`Failed to fetch file: ${response.statusText}`)
		}
		const blob = await response.blob()

		return blob
	} catch (e) {
		console.log('MASSIVE ERROR')
		console.log(e)
		throw e[1]
	}
}

/**
 *
 * @param {string} filePath the file path
 * @param {Blob} data the data to dave
 * @param {Function} cb callback
 * @param {string} isShared if file is shared
 */
function onSave(filePath, data, cb, isShared) {
	if (isShared === 'false') {
		saveFileContent(filePath, data)
			.then(() => cb())
			.catch(() => document.location.reload())  // We can now save? Maybe we are not allowed to? => Reload
	}
	// if it's through a share link, we shouldn't save (read only)
}

function onHasUnsavedChanges(unsavedChanges) {
	hasUnsavedChanges = unsavedChanges;
	const elem = document.querySelector('#unsaved-indicator')
	elem.className = unsavedChanges ? 'visible' : ''

	if (!unsavedChanges && wantReload) {
		document.location.reload();
	}
};

/**
 *
 * @param {string} fileId the id of the file
 */
async function getSessionForFile(fileId) {
	const response = await fetch(
		generateUrl(`/apps/openincryptpad/session/${fileId}`),
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
	/* eslint-disable no-unused-vars */
	const response = await fetch(myRequest)
	const blob = await response.blob()
	/* eslint-enable no-unused-vars */

	return blob

}
