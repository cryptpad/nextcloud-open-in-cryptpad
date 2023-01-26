<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\openincryptpad\Tests\Integration;

use OCP\AppFramework\App;
use OCP\IRequest;
use PHPUnit\Framework\TestCase;

use OCA\openincryptpad\Db\CryptPadSession;
use OCA\openincryptpad\Db\CryptPadSessionMapper;
use OCA\openincryptpad\Controller\CryptpadSessionController;

class SessionIntegrationTest extends TestCase {
	private CryptPadSessionController $controller;
	private QBMapper $mapper;
	private string $userId = 'john';

	public function setUp(): void {
		$app = new App('openincryptpad');
		$container = $app->getContainer();

		// only replace the user id
		$container->registerService('userId', function () {
			return $this->userId;
		});

		// we do not care about the request but the controller needs it
		$container->registerService(IRequest::class, function () {
			return $this->createMock(IRequest::class);
		});
		fwrite(STDERR, print_r($container, TRUE));
		$this->controller = $container->get(CryptpadSessionController::class);
		$this->mapper = $container->get(CryptPadSessionMapper::class);
	}

	public function testCreateSession(): void {
		$this->controller->put(23, 'test-session');

		$session = $this->mapper->find(23);
		$this->assertEquals($session->getId(), 23);
		$this->assertEquals($session->getSession(), 'test-session');
		$this->assertIsObject($session->getCreatedAt());

		// clean up
		$this->mapper->delete(23);
	}
}
