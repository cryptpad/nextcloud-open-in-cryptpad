<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use OCP\Files\IRootFolder;
use OCP\Share\IManager;

class FilePermissionService {
	private IRootFolder $rootFolder;
	private IManager $shareManager;

	public function __construct(IRootFolder $rootFolder, IManager $shareManager) {
		$this->rootFolder = $rootFolder;
		$this->shareManager = $shareManager;
	}

	public function hasWritePermission(int $fileId): bool
	{
		try {
			$nodes = $this->rootFolder->getById($fileId);
			foreach ($nodes as $node) {
				if ($node->isUpdateable()) {
					return true;
				}
			}
		} catch (\Throwable $e) {
			// user deleted, no mount, etc. -> treat as no access
		}
		return false;
	}

	/**
	 * @return string[] user ids that have write access to the file
	 */
	public function getUsersWithWritePermission(int $fileId): array
	{
		$nodes = $this->rootFolder->getById($fileId);
		if ($nodes === []) {
			return [];
		}
		$node = $nodes[0];

		$accessList = $this->shareManager->getAccessList($node);
		$uids = $accessList['users'];

		$owner = $node->getOwner();
		if ($owner !== null) {
			$uids[] = $owner->getUID();
		}

		$writeUsers = [];
		foreach (array_unique($uids) as $uid) {
			if ($this->userCanWrite($fileId, $uid)) {
				$writeUsers[] = $uid;
			}
		}
		sort($writeUsers);
		return $writeUsers;
	}

	private function userCanWrite(int $fileId, string $uid): bool
	{
		try {
			$userFolder = $this->rootFolder->getUserFolder($uid);
			foreach ($userFolder->getById($fileId) as $node) {
				if ($node->isUpdateable()) {
					return true;
				}
			}
		} catch (\Throwable $e) {
			// user deleted, no mount, etc. -> treat as no access
		}
		return false;
	}
}
