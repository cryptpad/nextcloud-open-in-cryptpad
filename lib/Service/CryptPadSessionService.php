<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
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

	public function __construct(IDBConnection $db, CryptPadSessionMapper $mapper) {
		$this->db = $db;
		$this->mapper = $mapper;
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

	public function find(int $id): CryptPadSession {
		try {
			return $this->mapper->find($id);
		} catch (Exception $e) {
			$this->handleException($e);
		}
	}

	public function optimisticUpdate(int $id, ?string $oldSessionKey, string $newSessionKey): CryptPadSession {
		$this->db->beginTransaction();
		try {
			$result = $this->optimisticUpdateImpl($id, $oldSessionKey, $newSessionKey);
			$this->db->commit();
			return $result;
		} catch (Throwable $e) {
			$this->db->rollBack();
			throw $e;
		}
	}

	public function optimisticUpdateImpl(int $id, ?string $oldSessionKey, string $newSessionKey): CryptPadSession {
		try {
			$dbSession = $this->find($id);
			if ($dbSession == null) {
				$actualOldKey = null;
			} else {
				$actualOldKey = $dbSession->getSessionKey();
			}
		} catch (CryptPadSessionNotFound $e) {
			$actualOldKey = null;
		}

		if ($actualOldKey == $oldSessionKey) {
			if ($newSessionKey == null) {
				return this->delete($id);
			} else {
				if ($actualOldKey == null) {
					return $this->create($id, $newSessionKey);
				} else {
					return $this->update($id, $newSessionKey);
				}
			}
		} else {
			return $actualOldKey;
		}
	}

	public function create(int $id, string $sessionKey): CryptPadSession {
		$dbSession = new CryptPadSession();
		$dbSession->setId($id);
		$dbSession->setSessionKey($sessionKey);
		$dbSession->setCreatedAt(new \DateTime());
		return $this->mapper->insert($dbSession);
	}

	public function update(int $id, string $sessionKey): CryptPadSession {
		try {
			$dbSession = $this->mapper->find($id);
			$dbSession->setSessionKey($sessionKey);
			$dbSession->setCreatedAt(new \DateTime());
			return $this->mapper->update($dbSession);
		} catch (Exception $e) {
			$this->handleException($e);
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
