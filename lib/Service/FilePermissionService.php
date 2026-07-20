<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use OCP\Files\IRootFolder;
use OCP\IUserSession;
use OCP\Share\IManager;
use OCP\Constants;

class FilePermissionService {
	private IRootFolder $rootFolder;
	private IManager $shareManager;
	private IUserSession $userSession;

	public function __construct(IRootFolder $rootFolder, IManager $shareManager, IUserSession $userSession) {
		$this->rootFolder = $rootFolder;
		$this->shareManager = $shareManager;
		$this->userSession = $userSession;
	}

	public function hasWritePermission(int $fileId, ?string $token = null): bool
	{
		$user = $this->userSession->getUser();

		// 1. Logged-in user: check via their own folder view
		if ($user !== null) {
			try {
				$userFolder = $this->rootFolder->getUserFolder($user->getUID());
				foreach ($userFolder->getById($fileId) as $node) {
					if ($node->isUpdateable()) {
						return true;
					}
				}
			} catch (\Throwable $e) {
			}
			return false;
		}

		// 2. Anonymous visitor (public share): validate the share token server-side
		if ($token !== null) {
			try {
				$share = $this->shareManager->getShareByToken($token);
				if ($share->getNodeId() === $fileId) {
					return ($share->getPermissions() & Constants::PERMISSION_UPDATE) !== 0;
				}
			} catch (\Throwable $e) {
			}
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
