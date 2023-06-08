import { confirmPassword } from '@nextcloud/password-confirmation'
import { generateUrl } from '@nextcloud/router'
import '@nextcloud/password-confirmation/dist/style.css' // Required for dialog styles

/**
 *
 */
async function handleSave() {
	const url = document.getElementById('openincryptpad-url').value

	await confirmPassword()

	await fetch(
		generateUrl('/apps/openincryptpad/settings/cryptPadUrl'),
		{
			method: 'PUT',
			headers: {
				requesttoken: OC.requestToken,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url }),
		}
	)
}

/**
 *
 */
async function initInput() {
	const urlInput = document.getElementById('openincryptpad-url')
	if (urlInput) {
		const response = await fetch(
			generateUrl('/apps/openincryptpad/settings/cryptPadUrl'),
			{
				headers: {
					requesttoken: OC.requestToken,
				},
			}
		)
		if (response.ok) {
			const body = await response.json()
			urlInput.value = body.url
		}
	}
}

const saveLink = document.getElementById('openincryptpad-save')
if (saveLink) {
	saveLink.onclick = handleSave
}

initInput()
