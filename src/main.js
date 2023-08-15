import { generateUrl } from '@nextcloud/router'

/* global _ */

/**
 *
 * @param {object} context the context
 * @param {string} mimeType the mime type of the file
 */
function handleOpenInCryptPad(context, mimeType) {
	location.href = generateUrl('/apps/openincryptpad/editor?id={id}&path={path}&mimeType={mimeType}', {
		id: context.fileInfoModel.id,
		path: context.fileInfoModel.getFullPath(),
		mimeType,
	})
}

window.addEventListener('DOMContentLoaded', function() {
	_.defer(function() {
		try {
			if (!OCA.Files) {
				return
			}

			for (const mimeType of ['text/markdown', 'application/x-drawio']) {
				OCA.Files.fileActions.registerAction({
					name: 'OpenInCryptPad',
					displayName: t('openincryptpad', 'Open in CryptPad'),
					order: 0,
					mime: mimeType,
					permissions: OC.PERMISSION_UPDATE,
					iconClass: 'icon-edit',
					actionHandler: (_filename, context) => handleOpenInCryptPad(context, mimeType),
				})
			}
		} catch (e) {
			console.error(e)
		}
	})
})
