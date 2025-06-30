<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use OCP\IConfig;

class SettingsService {
	public const APP_FOR_MIME_TYPE = [
		'text/markdown' => 'code',
		'application/x-drawio' => 'diagram',
	];

	public const MIME_TYPE_FOR_APP = [
		'code' => 'text/markdown',
		'diagram' => 'application/x-drawio',
	];

	public const FILE_TYPE_FOR_MIME_TYPE = [
		'text/markdown' => 'md',
		'application/x-drawio' => 'drawio',
	];

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
		return [
			// 'code', Disabled for now
			'diagram'
		];
	}
}
