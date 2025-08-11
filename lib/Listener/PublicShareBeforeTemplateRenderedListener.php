<?php

declare(strict_types=1);

namespace OCA\OpenInCryptPad\Listener;

use OCA\OpenInCryptPad\AppInfo\Application;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;


/** @template-implements IEventListener<\OCA\Files_Sharing\Event\BeforeTemplateRenderedEvent> */
class PublicShareBeforeTemplateRenderedListener implements IEventListener {

	public function __construct() {
	}

	public function handle(Event $event): void {
		Util::addScript(Application::APP_ID, 'openincryptpad-public');
	}
}