<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Controller;

use OCA\OpenInCryptPad\AppInfo\Application;
use OCP\AppFramework\ApiController;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\FileDisplayResponse;
use OCP\Constants;
use OCP\Files\Folder;
use OCP\Files\NotFoundException;
use OCP\IRequest;
use OCP\Share\Exceptions\ShareNotFound;
use OCP\Share\IManager as ShareManager;

class ShareController extends ApiController {
	private ShareManager $shareManager;

	use Errors;

	public function __construct(IRequest $request,
								ShareManager $shareManager) {
		parent::__construct(Application::APP_ID, $request);

		$this->shareManager = $shareManager;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 * @NoSameSiteCookieRequired
	 */
	public function image($token) {
		// No token no image
		if ($token === '') {
			return new DataResponse([], Http::STATUS_BAD_REQUEST);
		}

		// No share no image
		try {
			$share = $this->shareManager->getShareByToken($token);
		} catch (ShareNotFound $e) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}

		// No permissions no image
		if (($share->getPermissions() & Constants::PERMISSION_READ) === 0) {
			return new DataResponse([], Http::STATUS_FORBIDDEN);
		}

		// Password protected shares have no direct link!
		if ($share->getPassword() !== null) {
			return new DataResponse([], Http::STATUS_FORBIDDEN);
		}

		$attributes = $share->getAttributes();
		if ($attributes !== null && $attributes->getAttribute('permissions', 'download') === false) {
			return new DataResponse([], Http::STATUS_FORBIDDEN);
		}

		try {
			$node = $share->getNode();
			if ($node instanceof Folder) {
				// Direct link only works for single files
				return new DataResponse([], Http::STATUS_BAD_REQUEST);
			}

			$response = new FileDisplayResponse($node, Http::STATUS_OK, [
				'Content-Type' => $node->getMimeType(),
				'Cross-Origin-Resource-Policy' => 'cross-origin'
			]);
			$response->cacheFor(3600 * 24);
			return $response;
		} catch (NotFoundException $e) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		} catch (\InvalidArgumentException $e) {
			return new DataResponse([], Http::STATUS_BAD_REQUEST);
		}
	}
}
