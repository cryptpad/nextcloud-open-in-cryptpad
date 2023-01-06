<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\AppInfo;

use OCP\AppFramework\App;

class Application extends App {
	public const APP_ID = 'openincryptpad';

	public function __construct() {
		parent::__construct(self::APP_ID);
	}
}
