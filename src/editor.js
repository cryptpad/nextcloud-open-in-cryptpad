window.addEventListener('DOMContentLoaded', async function() {
    try {
        const parts = location.href.split('/');
        const fileId = parts.pop() || parts.pop();  // handle potential trailing slash
        const sessionKey = await getSessionForFile(fileId);

        var mystring = "Hello World!";
        var blob = new Blob([mystring], {
            type: 'text/markdown'
        });
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

        // let sessionKey = await getSessionForFile(fileId);

        // if (sessionKey == null || !CryptPad.isSessionActive(sessionKey)) {
        //     sessionKey = CryptPad.getSessionKey();
        //     await updateSessionForFile(fileId, sessionKey);
        // }

    } catch (e) {
        console.error(e);
    }
});

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
