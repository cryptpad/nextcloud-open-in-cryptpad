<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Controller;

use OCA\OpenInCryptPad\AppInfo\Application;
use OCA\OpenInCryptPad\Service\SettingsService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;

class EditorController extends Controller {
	private $userId;
	private SettingsService $settingsService;

	use Errors;

	public function __construct(IRequest $request,
								SettingsService $settingsService,
								?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->settingsService = $settingsService;
		$this->userId = $userId;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function page($id, $path, $mimeType, $isShared, $fileName): TemplateResponse {
		$app = SettingsService::APP_FOR_MIME_TYPE[$mimeType];
		$fileType = SettingsService::FILE_TYPE_FOR_MIME_TYPE[$mimeType];
		$cryptPadUrl = $this->settingsService->getCryptPadUrl($app);
		$apiUrl = $cryptPadUrl . '/cryptpad-api.js';
		$infoScript = $this->getInfoScript($id, $path, $mimeType, $fileType, $app, $cryptPadUrl, $isShared, $fileName);

		$response = new TemplateResponse(
			'openincryptpad',
			'editor', [
				'infoScript' => $infoScript,
				"apiUrl" => $apiUrl,
			]
		);
		$csp = new ContentSecurityPolicy();
		$csp->addAllowedFrameDomain($cryptPadUrl);
		$csp->addAllowedConnectDomain('blob:');
		$csp->addAllowedScriptDomain($apiUrl);
		$csp->addAllowedScriptDomain($this->getCSPHash($infoScript));
		$response->setContentSecurityPolicy($csp);
		return $response;
	}

	public function getInfoScript($id, $path, $mimeType, $fileType, $app, $cryptPadUrl, $isShared, $fileName): string {
		return 'window.OpenInCryptPadInfo = ' . json_encode([
			'fileId' => $id,
			'filePath' => $path,
			'mimeType' => $mimeType,
			'fileType' => $fileType,
			'app' => $app,
			'cryptPadUrl' => $cryptPadUrl,
			'isShared' => $isShared,
			'fileName' => $fileName
		]);
	}

	public function getCSPHash($str) {
		$hash = hash("sha256", $str, true);
		return '\'sha256-' . base64_encode($hash) . '\'';
	}
}
