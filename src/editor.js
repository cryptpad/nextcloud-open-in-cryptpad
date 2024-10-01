// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { generateUrl, generateOcsUrl, generateFilePath } from '@nextcloud/router'
import { getFilePickerBuilder } from '@nextcloud/dialogs'
import { saveFileContent, deferredToPromise } from './utils.js'
import { getRequestToken } from '@nextcloud/auth'

import '@nextcloud/dialogs/style.css'  // eslint-disable-line

__webpack_nonce__ = btoa(getRequestToken()) // eslint-disable-line
__webpack_public_path__ = generateFilePath('openincryptpad', '', 'js/') // eslint-disable-line

/* global CryptPadAPI */

let cryptPadSession = null

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
		} = window.OpenInCryptPadInfo
		document.title = fileName(filePath) + ' - Nextcloud'

		const sessionKey = await getSessionForFile(fileId)

		const blob = await loadFileContent(filePath, mimeType)

		const docUrl = URL.createObjectURL(blob)

		CryptPadAPI(cryptPadUrl, 'editor-content', {
			document: {
				url: docUrl,
				key: sessionKey,
				fileType,
			},
			documentType: app,
			events: {
				onSave: (data, cb) => onSave(filePath, data, cb),
				onNewKey: (data, cb) => updateSessionForFile(fileId, data, cb),
				onHasUnsavedChanges: (unsavedChanges) => {
					const elem = document.querySelector('#unsaved-indicator')
					elem.className = unsavedChanges ? 'visible' : ''
				},
				onInsertImage,
			},
			width: '100%',
			height: '100%',
		})

		checkForPermissionChange(filePath, () => resetCryptPadSession(fileId))
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
	const params = new URLSearchParams(location.search)
	const backButton = document.querySelector('#back-button')
	backButton.setAttribute('href', params.get('back'))
}

/**
 *
 * @param {object} data unused for now
 * @param {Function} callback called with the selected image as blob
 */
async function onInsertImage(data, callback) {
	const filepicker = getFilePickerBuilder(t('openincryptpad', 'Pick an image'))
		.addMimeTypeFilter('image/*')
		.build()

	const path = await filepicker.pick()

	const shares = await getShares(path)
	let url = findShareUrl(shares)
	if (!url) {
		const share = await createShare(path)
		url = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/openincryptpad/share/${share.token}`)
	}
	callback({ url }) // eslint-disable-line n/no-callback-literal
}

/**
 *
 * @param {(object)} shares all existing share for this file
 */
function findShareUrl(shares) {
	const share = shares.find((share) => share.share_type === OC.Share.SHARE_TYPE_LINK)
	if (!share) {
		return
	}

	const url = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/openincryptpad/share/${share.token}`)
	return url
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
 * @param {string} fileId the file ID
 */
async function resetCryptPadSession(fileId) {
	await updateSessionForFile(fileId, { old: cryptPadSession, new: null })
	document.location.reload()
}

/**
 *
 * @param {string} path the path to check
 * @param {Function} cb called, when the permissions change
 */
async function checkForPermissionChange(path, cb) {
	let permissions = await getFilePermission(path)
	while (true) {
		await delay(10 * 1000)
		const nextPermissions = await getFilePermission(path)
		if (permissions !== nextPermissions) {
			permissions = nextPermissions
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
 * @param {string} path the path
 */
async function getFilePermission(path) {
	return [await getShares(path, false), await getShares(path, true)]
		.flat()
		.filter((x) => x.can_edit)
		.map((x) => [x.share_with, x.uid_owner, x.uid_file_owner])
		.flat()
		.sort()
		.filter((item, pos, ary) => !pos || item !== ary[pos - 1]) // remove duplicates
		.join()
}

/**
 * @param {string} filePath the file path
 */
function fileName(filePath) {
	if (!filePath) {
		return
	}

	const parts = filePath.split('/')
	return parts[parts.length - 1]
}

/**
 *
 * @param {string} filePath the file path
 * @param {string} mimeType the mime type
 */
async function loadFileContent(filePath, mimeType) {
	const fileClient = OC.Files.getClient()
	try {
		const contents = (await deferredToPromise(fileClient.getFileContents(filePath)))[1]
		const blob = new Blob([contents], {
			type: mimeType,
		})

		return blob
	} catch (e) {
		throw e[1]
	}
}

/**
 *
 * @param {string} filePath the file path
 * @param {Blob} data the data to dave
 * @param {Function} cb callback
 */
function onSave(filePath, data, cb) {
	saveFileContent(filePath, data)
		.then(() => cb())
		.catch(cb)
}

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
 * @param {string} fileId the if of the file
 * @param {string} data the session data
 * @param {Function} cb the callback
 */
async function updateSessionForFile(fileId, data, cb) {
	const response = await fetch(
		generateUrl(`/apps/openincryptpad/session/${fileId}`),
		{
			method: 'PUT',
			headers: {
				requesttoken: OC.requestToken,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				newSessionKey: data.new,
				oldSessionKey: data.old,
			}),
		},
	)
	if (response.ok) {
		const body = await response.json()
		if (cb) {
			cb(body.sessionKey)
		}
		cryptPadSession = body.sessionKey
		return body.sessionKey
	} else {
		return null
	}
}

/**
 *
 * @param {string} path the path
 * @param {boolean} inherited return inherited shares?
 */
async function getShares(path, inherited) {
	const endpoint = inherited
		? '/apps/files_sharing/api/v1/shares/inherited'
		: '/apps/files_sharing/api/v1/shares'
	const params = new URLSearchParams({
		format: 'json',
		reshares: 'true',
		path,
	})
	const response = await fetch(
		generateOcsUrl(`${endpoint}?${params}`),
		{
			method: 'GET',
			headers: {
				requesttoken: OC.requestToken,
			},
		},
	)
	if (response.ok) {
		const body = await response.json()
		if (body.ocs.meta.status === 'ok') {
			return body.ocs.data
		}
	}
	return []
}

/**
 *
 * @param {string} path the path to the file which should be shared
 */
async function createShare(path) {
	const response = await fetch(
		generateOcsUrl('/apps/files_sharing/api/v1/shares?format=json'),
		{
			method: 'POST',
			headers: {
				requesttoken: OC.requestToken,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				attributes: '[]',
				path,
				shareType: OC.Share.SHARE_TYPE_LINK,
			}),
		},
	)
	if (response.ok) {
		const body = await response.json()
		if (body.ocs.meta.status === 'ok') {
			return body.ocs.data
		}
	}
	return {}
}
