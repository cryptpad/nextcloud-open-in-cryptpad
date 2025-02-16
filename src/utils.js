// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * @param {string} path the file path
 * @param {Blob} data the data to dave
 */
export async function saveFileContent(path, data) {
	const fileClient = OC.Files.getClient()
	try {
		await deferredToPromise(fileClient.putFileContents(
			path,
			data,
			{ overwrite: false }, // Bug in NextCloud? This has to be set to false to make the upload work.
		))
	} catch (e) {
		throw e[1]
	}
}

/**
 *
 * @param {string} path the file path
 */
export async function getFileInfo(path) {
	const fileClient = OC.Files.getClient()
	try {
		const result = await deferredToPromise(fileClient.getFileInfo(path))
		return result[1]
	} catch (e) {
		throw e[1]
	}
}

/**
 *
 * @param {any} deferred the deferred
 */
export function deferredToPromise(deferred) {
	return new Promise((resolve, reject) => {
		deferred
			.then((...args) => resolve(args))
			.fail((...args) => reject(args))
	})
}

export function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
}

export async function getFromLocalStorage() {
    var dataURI = localStorage.getItem("CryptPadData");
    localStorage.setItem("CryptPadData", "");
    return dataURItoBlob(dataURI);
}

export async function saveToLocalStorage(blob) {
  const reader = new FileReader();
  reader.onload = (event) => {
     localStorage.setItem("CryptPadData", event.target.result);
  }
  reader.readAsDataURL(blob);
}
