<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Controller;

use OCA\OpenInCryptPad\AppInfo\Application;
use OCA\OpenInCryptPad\Service\FilePermissionService;
use OCA\OpenInCryptPad\Service\CryptPadSessionService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

class CryptPadSessionController extends Controller {
	private CryptPadSessionService $service;
	protected IRootFolder $rootFolder;
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
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function get(int $id): DataResponse {
		if (!$this->permissionService->hasWritePermission($id)) {
			return new DataResponse('', Http::STATUS_FORBIDDEN);
		}

		return $this->handleNotFound(function () use ($id) {
			return $this->service->find($id);
		});
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function put(int $id, ?string $oldSessionKey, string $newSessionKey): DataResponse {
		if (!$this->permissionService->hasWritePermission($id)) {
			return new DataResponse('', Http::STATUS_FORBIDDEN);
		}

		return new DataResponse($this->service->optimisticUpdate($id, $oldSessionKey, $newSessionKey));
	}
}
