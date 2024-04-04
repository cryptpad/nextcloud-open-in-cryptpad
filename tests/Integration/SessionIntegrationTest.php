<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Tests\Integration;

use OCP\AppFramework\App;
use OCP\IRequest;
use PHPUnit\Framework\TestCase;

use OCA\OpenInCryptPad\Db\CryptPadSessionMapper;
use OCA\OpenInCryptPad\Service\FilePermissionService;
use OCA\OpenInCryptPad\Controller\CryptPadSessionController;

class SessionIntegrationTest extends TestCase {
	private CryptPadSessionController $controller;
	private CryptPadSessionMapper $mapper;
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

		// Always allow permission checks
		$permissionService = $this->createStub(FilePermissionService::class);
		$permissionService->method('hasWritePermission')->willReturn(true);
		$container->registerService(FilePermissionService::class, function () use ($permissionService) {
			return $permissionService;
		});

		$this->controller = $container->get(CryptPadSessionController::class);
		$this->mapper = $container->get(CryptPadSessionMapper::class);
	}

	public function testCreateSession(): void {
		$response = $this->controller->put(23, null, 'test-session');
		$this->assertEquals($response->getStatus(), 200);

		$session = $this->mapper->find(23);
		$this->assertEquals($session->getId(), 23);
		$this->assertEquals($session->getSessionKey(), 'test-session');
		$this->assertIsObject($session->getCreatedAt());

		// clean up
		$this->mapper->delete($session);
	}
}
