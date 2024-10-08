// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { confirmPassword } from '@nextcloud/password-confirmation'
import { generateUrl, generateFilePath } from '@nextcloud/router'
import { getRequestToken } from '@nextcloud/auth'
import '@nextcloud/password-confirmation/dist/style.css' // Required for dialog styles

__webpack_nonce__ = btoa(getRequestToken()) // eslint-disable-line
__webpack_public_path__ = generateFilePath('openincryptpad', '', 'js/') // eslint-disable-line

/**
 *
 */
async function handleSave() {
	await confirmPassword()

	const prefix = 'openincryptpad-url-'
	const inputs = document.querySelectorAll('input.openincryptpad-url')

	const promises = Array.from(inputs).map(async (i) => {
		const app = i.id.substring(prefix.length)
		await fetch(
			generateUrl(`/apps/openincryptpad/settings/cryptPadUrl/${app}`),
			{
				method: 'PUT',
				headers: {
					requesttoken: OC.requestToken,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ url: i.value }),
			},
		)
	})

	await Promise.all(promises)
}

const saveLink = document.getElementById('openincryptpad-save')
if (saveLink) {
	saveLink.onclick = handleSave
}
