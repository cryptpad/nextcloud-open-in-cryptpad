<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use OCP\Files\IRootFolder;

class FilePermissionService {
	private IRootFolder $rootFolder;

	public function __construct(IRootFolder $rootFolder) {
		$this->rootFolder = $rootFolder;
	}

	public function hasWritePermission(int $fileId): bool {
		$nodes = $this->rootFolder->getById($fileId);
		foreach ($nodes as $node) {
			if ($node->isUpdateable()) {
				return true;
			}
		}

		return false;
	}
}
