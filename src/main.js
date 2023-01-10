import { generateFilePath } from '@nextcloud/router'

// eslint-disable-next-line
__webpack_public_path__ = generateFilePath(appName, '', 'js/')


window.addEventListener('DOMContentLoaded', function() {
	_.defer(function() {
		try {
			console.log('Hello World!');
			for (const mimeType of ['text/markdown', 'application/x-drawio']) {
				OCA.Files.fileActions.registerAction({
					name: 'OpenInCryptpad',
					displayName: 'Open in CryptPad',
					order: 0,
					mime: mimeType,
					permissions: OC.PERMISSION_UPDATE,
					iconClass: 'icon-edit',
					actionHandler: function (filename, context) {
						console.log('Open in CryptPad', filename, context);
					}
				});
			}
			console.log('Registered');
		} catch (e) {
			console.error(e);
		}
	});
});
