<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Controller;

use OCA\OpenInCryptpad\AppInfo\Application;
use OCA\OpenInCryptpad\Service\CryptPadSessionNotFound;
use OCA\OpenInCryptpad\Service\CryptPadSessionService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\Files\IRootFolder;
use OCP\IRequest;
use Psr\Log\LoggerInterface;
use function OCP\Log\logger;

class CryptpadSessionController extends Controller {
	private CryptPadSessionService $service;
	protected IRootFolder $rootFolder;
	private ?string $userId;

	use Errors;

	public function __construct(IRequest $request,
								CryptPadSessionService $service,
								IRootFolder $rootFolder,
								LoggerInterface $logger,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->service = $service;
		$this->rootFolder = $rootFolder;
		$this->logger = $logger;
		$this->userId = $userId;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function get(int $id): DataResponse {
		if (!$this->hasWritePermission($id)) {
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
	public function put(int $id, string $sessionKey): DataResponse {
		if (!$this->hasWritePermission($id)) {
			return new DataResponse('', Http::STATUS_FORBIDDEN);
		}

		try {
			return new DataResponse($this->service->update($id, $sessionKey));
		} catch (CryptPadSessionNotFound $e) {
			return new DataResponse($this->service->create($id, $sessionKey));
		}
	}

	private function hasWritePermission(int $fileId): bool {
		$this->logger->error('hasWritePermission', ['fileId' => $fileId]);
		$nodes = $this->rootFolder->getById($fileId);
		$this->logger->error('hasWritePermission nodes', ['nodes' => $nodes]);
		foreach ($nodes as &$node) {
			$this->logger->error('hasWritePermission node', ['node' => $node]);
			if ($node->isUpdateable()) {
				return true;
			}
		}

		return false;
	}
}
