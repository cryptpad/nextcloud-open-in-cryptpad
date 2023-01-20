<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Controller;

use OCA\OpenInCryptpad\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IRequest;

class EditorController extends Controller {
	private $userId;
	private IConfig $config;

	use Errors;

	public function __construct(IRequest $request,
								IConfig $config,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->config = $config;
		$this->userId = $UserId;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function page(): TemplateResponse {
		$cryptPadUrl = $this->config->getAppValue('openincryptpad', 'CryptPadUrl');
		$response = new TemplateResponse(
			'openincryptpad',
			'editor', [
				"cryptPadUrl" => $cryptPadUrl,
				"apiUrl" => $cryptPadUrl . '/cryptpad-api.js',
			]
		);
        $csp = new ContentSecurityPolicy();
        $csp->addAllowedFrameDomain($cryptPadUrl);
        $csp->addAllowedConnectDomain('blob:');
        $response->setContentSecurityPolicy($csp);
		return $response;
	}
}
