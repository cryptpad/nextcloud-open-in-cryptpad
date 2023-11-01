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
			{ overwrite: false } // Bug in NextCloud? This has to be set to false to make the upload work.
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
