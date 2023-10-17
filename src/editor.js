import { generateUrl, generateOcsUrl } from '@nextcloud/router'
import { getFilePickerBuilder } from '@nextcloud/dialogs'
import { davGetClient, davRootPath } from '@nextcloud/files'

import '@nextcloud/dialogs/style.css'

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
				onInsertImage: onInsertImage
			},
		})

		checkForPermissionChange(filePath, () => resetCryptPadSession(fileId))

	} catch (e) {
		console.error(e)
		showError('Error while opening file')
	}
})

async function onInsertImage(data, callback) {
	const filepicker = getFilePickerBuilder(t('openincryptpad', 'Pick an image'))
		.addMimeTypeFilter('image/*')
		.addMimeTypeFilter('application/x-drawio')
		.build()

	const path = await filepicker.pick()

	const client = davGetClient()

	const url = client.getFileDownloadLink(`${davRootPath}${path}`)
	const blob = await fetchBlob(url)
	callback({blob})
}


async function fetchBlob(url) {
	const response = await fetch(url)
	return await response.blob()
}

/**
 *
 * @param message the message to show
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
 * @param {any} deferred the deferred
 */
function deferredToPromise(deferred) {
	return new Promise((resolve, reject) => {
		deferred
			.then((...args) => resolve(args))
			.fail((...args) => reject(args))
	})
}

/**
 *
 * @param {string} filePath the file path
 * @param {Blob} data the data to dave
 * @param {Function} cb callback
 */
async function onSave(filePath, data, cb) {
	const fileClient = OC.Files.getClient()
	try {
		await deferredToPromise(fileClient.putFileContents(
			filePath,
			data,
			{ overwrite: false } // Bug in NextCloud? This has to be set to false to make the upload work.
		))
		cb()
	} catch (e) {
		cb(e[1])
		throw e[1]
	}
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
		}
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
		}
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
		}
	)
	if (response.ok) {
		const body = await response.json()
		if (body.ocs.meta.status === 'ok') {
			return body.ocs.data
		}
	}
	return []
}
