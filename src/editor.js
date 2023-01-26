window.addEventListener('DOMContentLoaded', async function() {
    try {
        const { fileId, filePath } = parseUrl();
        const sessionKey = await getSessionForFile(fileId);

        const blob = await loadFileContent(filePath);

        var docUrl = URL.createObjectURL(blob);

        CryptPadAPI(window.OpenInCryptPadConfig.cryptPadUrl, 'editor-content', {
            document: {
                url: docUrl,
                key: sessionKey,
                fileType: 'md'
            },
            documentType: 'code', // appname
            events: {
                onSave: onSave,
                onNewKey: (newKey) => updateSessionForFile(fileId, newKey)
            }
        });

    } catch (e) {
        console.error(e);
    }
});

function parseUrl() {
    const params = new URLSearchParams(location.search);
    return {
        fileId: params.get('id'),
        filePath: params.get('path')
    };
}

async function loadFileContent(filePath) {
    const fileClient = OC.Files.getClient();
    try {
        const [status, contents] = await deferredToPromise(fileClient.getFileContents(filePath));
        const blob = new Blob([contents], {
            type: 'text/markdown'
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

async function onSave(data) {
    console.log('onSave', data);
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

async function updateSessionForFile(fileId, sessionKey) {
    await fetch(
        OC.generateUrl(`/apps/openincryptpad/session/${fileId}`),
        {
            method: 'PUT',
            headers: {
                requesttoken: OC.requestToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sessionKey: sessionKey})
        }
    );
}
