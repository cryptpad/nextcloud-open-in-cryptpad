import { generateUrl } from '@nextcloud/router'
import {
	DefaultType,
	registerFileAction,
} from '@nextcloud/files'

/**
 *
 * @param {number} fileId the file id
 * @param {string} filePath the file path
 * @param {string} mimeType the mime type
 * @param {string} backLink the backlink
 * @param {string} isShared if file is shared
 * @param {string} fileName the file name
 */
function openInCryptPad(fileId, filePath, mimeType, backLink, isShared, fileName) {
	location.href = generateUrl('/apps/openincryptpad/editor?id={id}&path={path}&mimeType={mimeType}&back={back}&isShared={isShared}&fileName={fileName}', {
		id: fileId,
		path: filePath,
		mimeType,
		back: backLink,
		isShared,
		fileName,
	})
}

const cryptPadIconn = '<svg  viewBox="0 0 24 24" width="20" height="20"></svg>'
const mimeTypes = ['application/x-drawio']
let firstTime = true
for (const mimeType of mimeTypes) {
	registerFileAction({
		id: 'edit-cryptpad-file',
		displayName() { return t('openincryptpad', 'Open in CryptPad') },
		iconSvgInline() { return cryptPadIconn },
		enabled(context) {
            const node = context.nodes[0]
			return node.mime === mimeType
		},
		async exec(context) {
			const backLink = window.location.href
            const node = context.nodes[0]
			if (firstTime) {
				firstTime = false
				return true
			}

			let isViewOnly = 'falseExternal'
			// console.log("PERMISSIONS", node.permissions)
			if (node.permissions === 17) {
				isViewOnly = 'trueExternal'
			}
			// we don't have access to file directly so we use a download link instead of it's path in the drive
			openInCryptPad(node.fileid, node.source, node.mime, backLink, isViewOnly, node.displayname)
			return true
		},
		default: DefaultType.DEFAULT,
	})
}
