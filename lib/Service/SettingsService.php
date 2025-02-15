<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use OCP\IConfig;

class SettingsService {
	public const APP_FOR_MIME_TYPE = [
		'text/markdown' => 'code',
		'text/plain' => 'code',
		'text/html' => 'pad',
		'text/code' => 'code',
		'application/x-drawio' => 'diagram',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'sheet',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'doc',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'presentation',
	];

	public const MIME_TYPE_FOR_APP = [
		'code' => 'text/code',
		'pad' => 'text/html',
		'diagram' => 'application/x-drawio',
		'sheet' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'doc' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'presentation' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	];

	public const FILE_TYPE_FOR_MIME_TYPE = [
		'text/markdown' => 'md',
		'text/code' => 'code',
		'text/plain' => 'txt',
		'text/html' => 'html',
		'application/x-drawio' => 'drawio',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
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
			'default',
			'code',
			'pad',
			'diagram',
			'sheet',
			'presentation',
			'doc',
		];
	}
}
