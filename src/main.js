async function handleOpenInCryptpad(filename, context) {
    location.href = OC.generateUrl('/apps/openincryptpad/editor?id={id}&path={path}', {
        id: context.fileInfoModel.id,
        path: context.fileInfoModel.getFullPath()
    });
}

window.addEventListener('DOMContentLoaded', function() {
    _.defer(function() {
        try {
            if (!OCA.Files) {
                return;
            }

            for (const mimeType of ['text/markdown', 'application/x-drawio']) {
                OCA.Files.fileActions.registerAction({
                    name: 'OpenInCryptpad',
                    displayName: t('openincryptpad', 'Open in CryptPad'),
                    order: 0,
                    mime: mimeType,
                    permissions: OC.PERMISSION_UPDATE,
                    iconClass: 'icon-edit',
                    actionHandler: handleOpenInCryptpad
                });
            }
        } catch (e) {
            console.error(e);
        }
    });
});
