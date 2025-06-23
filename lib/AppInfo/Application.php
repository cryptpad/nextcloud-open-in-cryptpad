<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\AppInfo;
use OCA\OpenInCryptPad\Listener\PublicShareBeforeTemplateRenderedListener;
use OCA\OpenInCryptPad\Listener\FilesLoadAdditionalScriptsListener;

use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Util;

class Application extends App implements IBootstrap {
	public const APP_ID = 'openincryptpad';

	public function __construct() {
		parent::__construct(self::APP_ID);
	}

	public function register(IRegistrationContext $context): void {
		// "This event is triggered when the files app is rendered. It can be used to add additional scripts to the files app."
		// See: https://docs.nextcloud.com/server/latest/developer_manual/basics/events.html#oca-files-event-loadadditionalscriptsevent
		$context->registerEventListener(\OCA\Files\Event\LoadAdditionalScriptsEvent::class, FilesLoadAdditionalScriptsListener::class);

		// "Emitted before the rendering step of the public share page happens. The event holds a flag that specifies if it is the authentication page of a public share."
		// See: https://docs.nextcloud.com/server/latest/developer_manual/basics/events.html#oca-files-sharing-event-beforetemplaterenderedevent
		$context->registerEventListener(\OCA\Files_Sharing\Event\BeforeTemplateRenderedEvent::class, PublicShareBeforeTemplateRenderedListener::class);
	}

	public function boot(IBootContext $context): void {
		/**
		 * Always add main script
		 */
		// Util::addInitScript(self::APP_ID, 'openincryptpad-main', 'files');
	}
}
