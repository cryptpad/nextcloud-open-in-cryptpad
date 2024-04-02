<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Settings;

use OCA\OpenInCryptPad\Service\SettingsService;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IL10N;
use OCP\Settings\ISettings;

class Admin implements ISettings {
	private IL10N $l;
	private SettingsService $settingsService;

	public function __construct(IL10N $l, SettingsService $settingsService) {
		$this->l = $l;
		$this->settingsService = $settingsService;
	}

	/**
	 * @return TemplateResponse
	 */
	public function getForm(): TemplateResponse {
		$urls = [];
		foreach ($this->settingsService->getAvailableApps() as $app) {
			$urls[$app] = $this->settingsService->getCryptPadUrl($app);
		}

		return new TemplateResponse(
			'openincryptpad',
			'admin',
			[
				'urls' => $urls
			],
			'blank'
		);
	}

	public function getSection() {
		return 'openincryptpad';
	}

	public function getPriority() {
		return 50;
	}
}
