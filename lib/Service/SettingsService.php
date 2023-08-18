<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use OCP\IConfig;

class SettingsService {
    private IDBConnection $db;
	private CryptPadSessionMapper $mapper;

	public function __construct(IConfig $config) {
		$this->config = $config;
	}

	public function setCryptPadUrl($app, $url): void {
		$this->config->setAppValue('openincryptpad', "CryptPadUrl:$app", $url);
	}

	public function getCryptPadUrl($app): string {
		return $this->config->getAppValue('openincryptpad', "CryptPadUrl:$app");
	}

	public function getAvailableApps(): array {
		return ['code', 'diagram'];
	}
}
