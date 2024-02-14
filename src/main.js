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

/* global _ */

const EMPTY_DRAWIO = '<mxfile type="embed"><diagram id="bWoO5ACGZIaXrIiKNTKd" name="Page-1"><mxGraphModel dx="1259" dy="718" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>'

/**
 *
 * @param {string} fileId Nextcloud ID of the file
 * @param {string} filePath path to the file
 * @param {string} mimeType the mime type of the file
 */
function openInCryptPad(fileId, filePath, mimeType, backLink) {
	location.href = generateUrl('/apps/openincryptpad/editor?id={id}&path={path}&mimeType={mimeType}&back={back}', {
		id: fileId,
		path: filePath,
		mimeType,
		back: backLink,
	})
}

async function createFolderLink(folderPath, folderId, viewId) {
	if (!folderId) {
		const result = await getFileInfo(folderPath)
		folderId = result.id
	}
	return window.OCP.Files.Router._router.resolve({
		params: { view: viewId, fileid: folderId },
		query: { dir: folderPath },
	}).href
}

/**
 *
 * @param {string} name name of the new file
 */
async function createEmptyDrawioFile(name, folder, folderId, viewId) {
	if (!name.endsWith('.drawio')) {
		name += '.drawio'
	}
	const path = `${folder}/${name}`.replace('//', '/')

	try {
		await saveFileContent(path, new Blob([EMPTY_DRAWIO], { type: 'application/x-drawio' }))
		const fileInfo = await getFileInfo(path)
		const backLink = await createFolderLink(folder, folderId, viewId)
		openInCryptPad(fileInfo.id, path, 'application/x-drawio', backLink)
	} catch (c) {
		showError(t('openincryptpad', 'File could not be created'))
	}
}

try {
	const mimeTypes = ['application/x-drawio']

	for (const mimeType of mimeTypes) {
		registerFileAction(new FileAction({
			id: 'edit-cryptpad-file',
			displayName() {	return t('openincryptpad', 'Open in CryptPad') },
			iconSvgInline() { return '' },
			enabled(nodes) {
				return nodes.length === 1
					&& nodes[0].mime === mimeType
					&& nodes[0].attributes.permissions.includes('W')
			},
			async exec(node, view, dir) {
				const backLink = await createFolderLink(dir, null, view.id)
				openInCryptPad(node.fileid, node.path, node.mime, backLink)
				return true
			},
			default: DefaultType.DEFAULT
		}))
	}

	function getUniqueName(name, ext, names) {
		let newName;

		do {
			newName = name + '-' + Math.round(Math.random() * 1000000) + '.' + ext;
		} while (names.includes(newName)) 

		return newName;
	}

	addNewFileMenuEntry({
		id: 'add-drawio-file',
		displayName: t('openincryptpad', 'New draw.io diagram'),
		enabled() {
			return getNavigation()?.active?.id === 'files'
		},
		iconClass: 'icon-add',
		iconSvgInline: '',
		async handler(context, content) {
			const contentNames = content.map((node) => node.basename);
			const fileName = getUniqueName('diagram', 'drawio', contentNames)
			createEmptyDrawioFile(fileName, context.path, context.fileid, 'files')
		}
	});
} catch (e) {
	console.error(e)
}
