<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Controller;

use OCA\OpenInCryptpad\AppInfo\Application;
use OCA\OpenInCryptpad\Service\CryptPadSessionService;
use OCA\OpenInCryptpad\Service\CryptPadSessionNotFound;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class CryptpadSessionController extends Controller {
	private CryptPadSessionService $service;
	private ?string $userId;

	use Errors;

	public function __construct(IRequest $request,
								CryptPadSessionService $service,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->service = $service;
		$this->userId = $userId;
	}

	public function get(int $id): DataResponse {
		return $this->handleNotFound(function () use ($id) {
			return $this->service->find($id);
		});
	}

	public function put(int $id, string $sessionKey): DataResponse {
		try {
			return new DataResponse($this->service->update($id, $sessionKey));
		} catch (CryptPadSessionNotFound $e) {
			return new DataResponse($this->service->create($id, $sessionKey));
		}
	}
}
