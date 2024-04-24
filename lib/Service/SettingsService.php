<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use OCP\IConfig;

class SettingsService {
	const APP_FOR_MIME_TYPE = [
		'text/markdown' => 'code',
		'application/x-drawio' => 'diagram',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'sheet'
	];

	const MIME_TYPE_FOR_APP = [
		'code' => 'text/markdown',
		'diagram' => 'application/x-drawio',
        'sheet' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	];

	const FILE_TYPE_FOR_MIME_TYPE = [
		'text/markdown' => 'md',
		'application/x-drawio' => 'drawio',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx'
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

    // TODO: make this list configurable
	public function getAvailableApps(): array {
		return [
            'sheet',
            'code',
			'diagram'
		];
	}

    public function getAvailableTypes(): string {
        $list = $this->getAvailableApps();
        $str = "";
        foreach($list as $app) {
            $str .= SettingsService::MIME_TYPE_FOR_APP[$app];
            $str .= ',';
        }
        return $str;
    }

}
