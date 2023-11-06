import { generateUrl } from '@nextcloud/router'
import { saveFileContent, getFileInfo } from './utils.js'
import { showError } from '@nextcloud/dialogs'
import { getRequestToken } from '@nextcloud/auth'

__webpack_nonce__ = btoa(getRequestToken()) // eslint-disable-line

/* global _ */

const EMPTY_DRAWIO = '<mxfile type="embed"><diagram id="bWoO5ACGZIaXrIiKNTKd" name="Page-1"><mxGraphModel dx="1259" dy="718" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>'

/**
 *
 * @param {string} fileId Nextcloud ID of the file
 * @param {string} filePath path to the file
 * @param {string} mimeType the mime type of the file
 */
function openInCryptPad(fileId, filePath, mimeType) {
	location.href = generateUrl('/apps/openincryptpad/editor?id={id}&path={path}&mimeType={mimeType}&back={back}', {
		id: fileId,
		path: filePath,
		mimeType,
		back: location.href,
	})
}

/**
 *
 * @param {string} name name of the new file
 */
async function createEmptyDrawioFile(name) {
	if (!name.endsWith('.drawio')) {
		name += '.drawio'
	}
	const path = (getCurrentDirectory() + `/${name}`).replace('//', '/')

	try {
		await saveFileContent(path, new Blob([EMPTY_DRAWIO], { type: 'application/x-drawio' }))
		const fileInfo = await getFileInfo(path)
		openInCryptPad(fileInfo.id, path, 'application/x-drawio')
	} catch (c) {
		showError(t('openincryptpad', 'File could not be created'))
	}
}

/**
 * Return the current directory, fallback to root
 *
 * @return {string}
 */
const getCurrentDirectory = function() {
	const currentDirInfo = OCA?.Files?.App?.currentFileList?.dirInfo
		|| { path: '/', name: '' }

	// Make sure we don't have double slashes
	return `${currentDirInfo.path}/${currentDirInfo.name}`.replace(/\/\//gi, '/')
}

window.addEventListener('DOMContentLoaded', function() {
	_.defer(function() {
		try {
			if (!OCA.Files) {
				return
			}

			const mimeTypes = ['application/x-drawio']

			for (const mimeType of mimeTypes) {
				OCA.Files.fileActions.registerAction({
					name: 'OpenInCryptPad',
					displayName: t('openincryptpad', 'Open in CryptPad'),
					order: 0,
					mime: mimeType,
					permissions: OC.PERMISSION_UPDATE,
					iconClass: 'icon-edit',
					actionHandler: (filename, context) => {
						const fileInfo = context.fileInfo || context.fileList.findFile(filename)
						const path = (fileInfo.path + `/${filename}`).replace('//', '/')
						openInCryptPad(fileInfo.id, path, mimeType)
					},
				})

				OCA.Files.fileActions.setDefault(mimeType, 'OpenInCryptPad')
			}

			const addDrawioFile = {
				attach(menu) {
					// register the new menu entry
					menu.addMenuEntry({
						id: 'add-drawio-file',
						displayName: t('openincryptpad', 'New draw.io diagram'),
						templateName: t('openincryptpad', 'diagram.drawio'),
						iconClass: 'icon-add',
						fileType: 'file',
						actionLabel: t('openincryptpad', 'New draw.io diagram'),
						actionHandler(name) {
							createEmptyDrawioFile(name)
						},
					})
				},
			}
			OC.Plugins.register('OCA.Files.NewFileMenu', addDrawioFile)
		} catch (e) {
			console.error(e)
		}
	})
})
