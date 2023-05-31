const APP_FOR_MIME_TYPE = {
    'text/markdown': 'code',
    'application/x-drawio': 'drawio',
};

const FILE_TYPE_FOR_MIME_TYPE = {
    'text/markdown': 'md',
    'application/x-drawio': 'drawio',
};

window.addEventListener('DOMContentLoaded', async function() {
    try {
        const { fileId, filePath, mimeType } = parseUrl();
        document.title = fileName(filePath) + ' - Nextcloud';

        const sessionKey = await getSessionForFile(fileId);

        const blob = await loadFileContent(filePath, mimeType);

        var docUrl = URL.createObjectURL(blob);

        CryptPadAPI(window.OpenInCryptPadConfig.cryptPadUrl, 'editor-content', {
            document: {
                url: docUrl,
                key: sessionKey,
                fileType: FILE_TYPE_FOR_MIME_TYPE[mimeType]
            },
            documentType: APP_FOR_MIME_TYPE[mimeType],
            events: {
                onSave: (data, cb) => onSave(filePath, data, cb),
                onNewKey: (data, cb) => updateSessionForFile(fileId, data, cb),
                onHasUnsavedChanges: (unsavedChanges) => {
                    const elem = document.querySelector('#unsaved-indicator');
                    elem.className = unsavedChanges ? 'visible' : '';
                }
            }
        });

    } catch (e) {
        console.error(e);
    }
});

function fileName(filePath) {
    if (!filePath) {
        return;
    }

    const parts = filePath.split('/');
    return parts[parts.length-1];
}

function parseUrl() {
    const params = new URLSearchParams(location.search);
    return {
        fileId: params.get('id'),
        filePath: params.get('path'),
        mimeType: params.get('mimeType'),
    };
}

async function loadFileContent(filePath, mimeType) {
    const fileClient = OC.Files.getClient();
    try {
        const [status, contents] = await deferredToPromise(fileClient.getFileContents(filePath));
        const blob = new Blob([contents], {
            type: mimeType
        });

        return blob;
    } catch (e) {
        console.log('ERROR', e);
        throw e[1];
    }
}

function deferredToPromise(deferred) {
    return new Promise((resolve, reject) => {
        deferred
            .then((...args) => resolve(args))
            .fail((...args) => reject(args));
    });
}

async function onSave(filePath, data, cb) {
    console.log('onSave', data);
    const fileClient = OC.Files.getClient();
    try {
        await deferredToPromise(fileClient.putFileContents(
            filePath,
            data,
            {overwrite: false}  // Bug in NextCloud? This has to be set to false to make the upload work.
        ));
        cb();
    } catch (e) {
        console.log('ERROR', e);
        cb(e[1]);
        throw e[1];
    }
}

async function getSessionForFile(fileId) {
    const response = await fetch(
        OC.generateUrl(`/apps/openincryptpad/session/${fileId}`),
        {
            headers: {
                requesttoken: OC.requestToken
            }
        }
    );
    if (response.ok) {
        const body = await response.json();
        return body.sessionKey;
    } else {
        return null;
        // return '/2/integration/edit/jg0wwmJ7GsF3R31b-Ur5URGI/';
    }
}

async function updateSessionForFile(fileId, data, cb) {
    const response = await fetch(
        OC.generateUrl(`/apps/openincryptpad/session/${fileId}`),
        {
            method: 'PUT',
            headers: {
                requesttoken: OC.requestToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newSessionKey: data.new,
                oldSessionKey: data.old,
            })
        }
    );
    if (response.ok) {
        const body = await response.json();
        cb(body.sessionKey);
        return body.sessionKey;
    } else {
        return null;
    }
}
