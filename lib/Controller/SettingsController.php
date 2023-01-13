<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Controller;

use OCA\OpenInCryptpad\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IConfig;
use OCP\IRequest;

class SettingsController extends Controller {
	private $userId;
	private IConfig $config;

	use Errors;

	public function __construct(IRequest $request,
								IConfig $config,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->config = $config;
		$this->userId = $UserId;
	}

	/**
	 * // @PasswordConfirmationRequired
	 * @AuthorizedAdminSetting(settings=OCA\OpenInCryptpad\Settings\Admin)
	 */
	public function setCryptPadUrl(): void {
		$url = $this->request->getParam('url');
		$this->config->setAppValue('openincryptpad', 'CryptPadUrl', $url);
	}

	public function getCryptPadUrl(): DataResponse {
		$url = $this->config->getAppValue('openincryptpad', 'CryptPadUrl');
		return new DataResponse(['url' => $url]);
	}
}
