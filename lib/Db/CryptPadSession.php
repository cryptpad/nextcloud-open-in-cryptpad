<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Db;

use JsonSerializable;

use OCP\AppFramework\Db\Entity;

/**
 * @method getFileId(): int
 * @method setFileId(int $fileId): void
 * @method getSession(): string
 * @method setSession(string $title): void
 */
class CryptPadSession extends Entity implements JsonSerializable {
	protected string $sessionKey = '';

	public function jsonSerialize(): array {
		return [
			'id' => $this->id,
			'sessionKey' => $this->sessionKey,
		];
	}
}
