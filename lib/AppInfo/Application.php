<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\AppInfo;

use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Util;
use function OCP\Log\logger;

class Application extends App implements IBootstrap {
	public const APP_ID = 'openincryptpad';

	public function __construct() {
		parent::__construct(self::APP_ID);
	}

	public function register(IRegistrationContext $context): void {
		/**
		 * Always add main script
		 */
		Util::addScript(self::APP_ID, 'openincryptpad-main', 'files');

		// TODO this line should not be necessary (and is not owrking anyway)
		Util::addTranslations(self::APP_ID);
		logger('openincryptpad')->warning('getScripts 2', Util::getScripts());
	}

	public function boot(IBootContext $context): void {
	}
}
