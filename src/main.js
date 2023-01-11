import { generateFilePath } from '@nextcloud/router'

// eslint-disable-next-line
__webpack_public_path__ = generateFilePath(appName, '', 'js/')

async function handleOpenInCryptpad(filename, context) {
	console.log('Open in CryptPad', filename, context);
    const fileId = context.fileInfoModel.id;
    const response = await fetch(
        OC.generateUrl(`/apps/openincryptpad/session/${fileId}`),
        {
            headers: {
                requesttoken: OC.requestToken
            }
        }
    );
    const body = await response.json();
	console.log(body);
}

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
					actionHandler: handleOpenInCryptpad
				});
			}
			console.log('Registered');
		} catch (e) {
			console.error(e);
		}
	});
});
