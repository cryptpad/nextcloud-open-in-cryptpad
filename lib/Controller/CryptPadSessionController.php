<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Controller;

use OCA\OpenInCryptPad\AppInfo\Application;
use OCA\OpenInCryptPad\Db\CryptPadSession;
use OCA\OpenInCryptPad\Service\FilePermissionService;
use OCA\OpenInCryptPad\Service\CryptPadSessionService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

class CryptPadSessionController extends Controller {
	private CryptPadSessionService $service;
	private FilePermissionService $permissionService;
	private LoggerInterface $logger;
	private ?string $userId;

	use Errors;

	public function __construct(IRequest $request,
								CryptPadSessionService $service,
								FilePermissionService $permissionService,
								LoggerInterface $logger,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->service = $service;
		$this->permissionService = $permissionService;
		$this->logger = $logger;
		$this->userId = $userId;
	}

	/**
	 * @PublicPage
	 * @UseSession
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function get(int $fileId, ?string $token = null): DataResponse {
		if (!$this->permissionService->hasWritePermission($fileId, $token)) {
			return new DataResponse('', Http::STATUS_FORBIDDEN);
		}

		return $this->handleNotFound(function () use ($fileId) {
			$session = $this->service->get($fileId);
			return $session;
		});
	}
}
