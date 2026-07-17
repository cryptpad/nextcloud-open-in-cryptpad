import { openInCryptPad } from './utils.js'
import {
	DefaultType,
	registerFileAction,
} from '@nextcloud/files'

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

			const isViewOnly = (node.permissions === 17)
			// we don't have access to file directly so we use a download link instead of it's path in the drive
			openInCryptPad(node.fileid, node.source, node.mime, backLink, isViewOnly, true, node.displayname)
			return true
		},
		default: DefaultType.DEFAULT,
	})
}
