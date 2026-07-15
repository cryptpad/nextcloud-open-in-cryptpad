<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Service;

use Exception;

use OCA\OpenInCryptPad\Db\CryptPadSession;
use OCA\OpenInCryptPad\Db\CryptPadSessionMapper;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\IDBConnection;

class CryptPadSessionService {
	private IDBConnection $db;
	private CryptPadSessionMapper $mapper;
	private FilePermissionService $filePermissionService;

	public function __construct(IDBConnection $db, CryptPadSessionMapper $mapper, FilePermissionService $filePermissionService) {
		$this->db = $db;
		$this->mapper = $mapper;
		$this->filePermissionService = $filePermissionService;
	}

	public function get(int $fileId) {
		$writeUsers = $this->filePermissionService->getUsersWithWritePermission($fileId);
		$writeUsersStr = implode(' ', $writeUsers);
		try {
			$session = $this->mapper->find($fileId);
			if ($session->getWriteUsers() == $writeUsersStr) {
				return $session;
			}

			$session->setWriteUsers($writeUsersStr);
			$session->setSessionKey($this->randomBase64UrlSafe());
			return $this->mapper->update($session);
		} catch (DoesNotExistException $e) {
			$session = new CryptPadSession();
			$session->setId($fileId);
			$session->setCreatedAt(new \DateTime());
			$session->setWriteUsers($writeUsersStr);
			$session->setSessionKey($this->randomBase64UrlSafe());
			return $this->mapper->insert($session);
		}
	}

	private function randomBase64UrlSafe(int $length = 64): string
	{
		return rtrim(strtr(base64_encode(random_bytes($length)), '+/', '-_'), '=');
	}

	/**
	 * @return never
	 */
	private function handleException(Exception $e) {
		if ($e instanceof DoesNotExistException ||
			$e instanceof MultipleObjectsReturnedException) {
			throw new CryptPadSessionNotFound($e->getMessage());
		} else {
			throw $e;
		}
	}

	public function delete(int $id): CryptPadSession {
		try {
			$dbSession = $this->mapper->find($id);
			$this->mapper->delete($dbSession);
			return $dbSession;
		} catch (Exception $e) {
			$this->handleException($e);
		}
	}
}
