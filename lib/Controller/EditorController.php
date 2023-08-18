<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Controller;

use OCA\OpenInCryptPad\AppInfo\Application;
use OCA\OpenInCryptPad\Service\SettingsService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;

class EditorController extends Controller {
	const APP_FOR_MIME_TYPE = [
		'text/markdown' => 'code',
		'application/x-drawio' => 'diagram',
	];

	const FILE_TYPE_FOR_MIME_TYPE = [
		'text/markdown' => 'md',
		'application/x-drawio' => 'drawio',
	];

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
	public function page($id, $path, $mimeType): TemplateResponse {
		$app = self::APP_FOR_MIME_TYPE[$mimeType];
		$fileType = self::FILE_TYPE_FOR_MIME_TYPE[$mimeType];
		$cryptPadUrl = $this->settingsService->getCryptPadUrl($app);

		$response = new TemplateResponse(
			'openincryptpad',
			'editor', [
				'info' => json_encode([
					'fileId' => $id,
					'filePath' => $path,
					'mimeType' => $mimeType,
					'fileType' => $fileType,
					'app' => $app,
					'cryptPadUrl' => $cryptPadUrl,
				]),
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
