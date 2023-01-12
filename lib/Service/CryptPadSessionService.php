<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Service;

use Exception;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;

use OCA\OpenInCryptpad\Db\CryptPadSession;
use OCA\OpenInCryptpad\Db\CryptPadSessionMapper;

class CryptPadSessionService {
	private CryptPadSessionMapper $mapper;

	public function __construct(CryptPadSessionMapper $mapper) {
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

	public function create(int $id, string $sessionKey): CryptPadSession {
		$dbSession = new CryptPadSession();
		$dbSession->setId($id);
		$dbSession->setSessionKey($sessionKey);
		return $this->mapper->insert($dbSession);
	}

	public function update(int $id, string $sessionKey): CryptPadSession {
		try {
			$dbSession = $this->mapper->find($id);
			$dbSession->setSessionKey($sessionKey);
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
