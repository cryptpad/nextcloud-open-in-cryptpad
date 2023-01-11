<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Controller;

use OCA\OpenInCryptpad\AppInfo\Application;
use OCA\OpenInCryptpad\Service\NoteService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class CryptpadSessionController extends Controller {
	private ?string $userId;

	use Errors;

	public function __construct(IRequest $request,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->userId = $userId;
	}

	public function get(int $id): DataResponse {
		return new DataResponse("some session " . $id . " " . $this->userId);
	}
}
