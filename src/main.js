// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { generateUrl, generateFilePath } from '@nextcloud/router'
import { saveFileContent, getFileInfo } from './utils.js'
import { showError } from '@nextcloud/dialogs'
import { getRequestToken } from '@nextcloud/auth'
import {
	DefaultType,
	FileAction,
	addNewFileMenuEntry,
	registerFileAction,
	getNavigation,
} from '@nextcloud/files'

__webpack_nonce__ = btoa(getRequestToken()) // eslint-disable-line
__webpack_public_path__ = generateFilePath('openincryptpad', '', 'js/') // eslint-disable-line

const EMPTY_DRAWIO = '<mxfile type="embed"><diagram id="bWoO5ACGZIaXrIiKNTKd" name="Page-1"><mxGraphModel dx="1259" dy="718" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>'

/**
 *
 * @param {string} fileId Nextcloud ID of the file
 * @param {string} filePath path to the file
 * @param {string} mimeType the mime type of the file
 * @param {string} backLink the URL back to Nextcloud
 */
function openInCryptPad(fileId, filePath, mimeType, backLink, isShared, fileName) {
	location.href = generateUrl('/apps/openincryptpad/editor?id={id}&path={path}&mimeType={mimeType}&back={back}&isShared={isShared}&fileName={fileName}', {
		id: fileId,
		path: filePath,
		mimeType,
		back: backLink,
		isShared, 
		fileName
	})
}

/**
 *
 * @param {string} folderPath the path to the folder
 * @param {string} folderId the ID of the folder
 */
async function createFolderLink(folderPath, folderId) {
	if (!folderId) {
		const result = await getFileInfo(folderPath)
		folderId = result.id
	}
	return window.OCP.Files.Router._router.resolve({
		params: { view: 'files', fileid: folderId },
		query: { dir: folderPath },
	}).href
}

/**
 *
 * @param {string} name name of the new file
 * @param {string} folder name ot the folder
 * @param {string} folderId id of the folder
 */
async function createEmptyDrawioFile(name, folder, folderId) {
	if (!name.endsWith('.drawio')) {
		name += '.drawio'
	}
	const path = `${folder}/${name}`.replace('//', '/')

	try {
		await saveFileContent(path, new Blob([EMPTY_DRAWIO], { type: 'application/x-drawio' }))
		const fileInfo = await getFileInfo(path)
		const backLink = await createFolderLink(folder, folderId)
		openInCryptPad(fileInfo.id, path, 'application/x-drawio', backLink, false, "New file")
	} catch (c) {
		showError(t('openincryptpad', 'File could not be created'))
	}
}

/**
 *
 * @param {string} name prefix of the new name
 * @param {string} ext extension of the new name
 * @param {(string)} names all existinf file names
 */
function getUniqueName(name, ext, names) {
	let newName

	do {
		newName = name + '-' + Math.round(Math.random() * 1000000) + '.' + ext
	} while (names.includes(newName))

	return newName
}

/**
 *
 * @param {number} permissions the permissions as bit set
 */
function hasWritePermission(permissions) {
	const UPDATE = 2

	return (permissions & UPDATE) === UPDATE
}

const mimeTypes = ['application/x-drawio']
const cryptPadIconn = `<svg  viewBox="0 0 24 24" width="20" height="20"></svg>`;
// when opening a share link it automatically opens it in cryptpad, but 
// we should let the user decide whether to do that or download it
var firstTime = true
for (const mimeType of mimeTypes) {
	registerFileAction(new FileAction({
		id: 'edit-cryptpad-file',
		displayName() { return t('openincryptpad', 'Open in CryptPad') },
		iconSvgInline() { return cryptPadIconn },
		enabled(nodes) {
			return nodes.length === 1 && nodes[0].mime === mimeType
		},
		async exec(node, view, dir) {
			if (window.location.pathname.includes('/index.php/s/')) {
				if (firstTime) {
					firstTime = false
					return true
				}
				const backLink = '' // TODO? currently doesn't work in shared
				// since we don't have access to the filepath in the drive, we use
				// the link for downloading the file
				const currentUrl = new URL(window.location.href)
				const shareToken = currentUrl.pathname.split('/').pop()
				const downloadUrl = `${currentUrl.origin}/index.php/s/${shareToken}/download`
				console.log(node.fileid)
				openInCryptPad(node.fileid, downloadUrl, node.mime, backLink, 'true', node.displayname)
				return true
			}
			const backLink = await createFolderLink(dir, null)
			console.log(node.fileid)
			openInCryptPad(node.fileid, node.path, node.mime, backLink, 'false', node.displayname)
			return true
		},
		default: DefaultType.DEFAULT,
	}))
}

/**
 *
 */
async function main() {
	try {
		const [cryptPadIcon, diagramIcon] = await Promise.all([
			loadIcon('app-dark.svg'),
			loadIcon('diagram.svg'),
		])
		
		addNewFileMenuEntry({
			id: 'add-drawio-file',
			displayName: t('openincryptpad', 'New diagrams.net diagram'),
			enabled() {
				return getNavigation()?.active?.id === 'files'
			},
			iconClass: 'icon-add',
			iconSvgInline: diagramIcon,
			async handler(context, content) {
				const contentNames = content.map((node) => node.basename)
				const fileName = getUniqueName('diagram', 'drawio', contentNames)
				createEmptyDrawioFile(fileName, context.path, context.fileid)
			},
		})
	} catch (e) {
		console.error(e)
	}
}

/**
 *
 * @param {string} name name of the icon
 */
async function loadIcon(name) {
	const response = await fetch(
		`/apps/openincryptpad/img/${name}`,
		{
			method: 'GET',
			headers: {
				requesttoken: OC.requestToken,
			},
		},
	)
	if (response.ok) {
		return await response.text()
	}
	return ''
}

main()
