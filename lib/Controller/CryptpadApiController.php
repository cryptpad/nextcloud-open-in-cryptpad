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
use OCP\Http\Client\IClientService;
use OCP\IConfig;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

class CryptpadApiController extends Controller {
    private IClientService $clientService;
	private IConfig $config;

	public function __construct(IRequest $request,
								IClientService $clientService,
								LoggerInterface $logger,
								IConfig $config) {
		parent::__construct(Application::APP_ID, $request);
        $this->clientService = $clientService;
		$this->config = $config;
		$this->logger = $logger;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function load(): DataResponse {
		$url = $this->config->getAppValue('openincryptpad', 'CryptPadUrl');
        $client = $this->clientService->newClient();
		try {
			$content = $client->get($url . '/cryptpad-api.js')->getBody();
		} catch (\Exception) {
			$content = 'error';
		}

		return new DataResponse($content);
	}
}
