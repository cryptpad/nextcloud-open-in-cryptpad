<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Controller;

use OCA\OpenInCryptPad\AppInfo\Application;
use OCA\OpenInCryptPad\Service\SettingsService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class SettingsController extends Controller {
	private $userId;
	private SettingsService $settingsService;

	use Errors;

	public function __construct(IRequest $request,
								SettingsService $settingsService,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->settingsService = $settingsService;
		$this->userId = $userId;
	}

	/**
	 * @AuthorizedAdminSetting(settings=OCA\OpenInCryptPad\Settings\Admin)
	 */
	public function setCryptPadUrl($app): void {
		$url = $this->request->getParam('url');
		$this->settingsService->setCryptPadUrl($app, $url);
	}

	public function getCryptPadUrl($app): DataResponse {
		$url = $this->settingsService->getCryptPadUrl($app);
		return new DataResponse(['url' => $url]);
	}
}
