import simpleCache from "./simpleCache";

async function handleOpenInCryptpad(filename, context) {
    console.log('Open in CryptPad', filename, context);
    await loadCryptPadApi();
    console.log('API loaded');
    // const fileId = context.fileInfoModel.id;

    // let sessionKey = await getSessionForFile(fileId);

    // if (sessionKey == null || !CryptPad.isSessionActive(sessionKey)) {
    //     sessionKey = CryptPad.getSessionKey();
    //     await updateSessionForFile(fileId, sessionKey);
    // }

    // CryptPad.start({
    //     application: 'code',
    //     document: 'TODO',
    //     sessionKey: sessionKey,
    //     onSave: function () {console.log('CryptPad onSave');},
    //     userData: null,
    // });
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

const loadCryptPadApi = simpleCache(async function() {
    await loadJavaScript(OC.generateUrl('/apps/openincryptpad/cryptpad-api.js'));
});

async function getCryptPadApiJsUrl() {
    const response = await fetch(
        OC.generateUrl('/apps/openincryptpad/settings/cryptPadUrl'),
        {
            headers: {
                requesttoken: OC.requestToken
            }
        }
    );
    if (response.ok) {
        const body = await response.json();
        return body.url;
    } else {
        return null;
    }
}

function loadJavaScript(url) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.nonce = OC.requestToken;
        script.onload = resolve
        script.src = url;
        document.head.appendChild(script);
    });
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

window.CryptPad = {
    getSessionKey: function() {
        return (Math.random() + 1).toString(36).substring(7);
    },

    isSessionActive: function(sessionKey) {
        return false;
    },

    start: function(config) {
        console.log('CryptPad.start', config);
    }
};
