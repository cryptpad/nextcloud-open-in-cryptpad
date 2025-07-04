<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Db;

use JsonSerializable;

use OCP\AppFramework\Db\Entity;

/**
 * @method getFileId(): int
 * @method setFileId(int $fileId): void
 * @method getSessionKey(): string
 * @method setSessionKey(string $sessionKey): void
 * @method getCreatedAt(): \DateTime
 * @method setCreatedAt(\DateTime createAt): void
 */
class CryptPadSession extends Entity implements JsonSerializable {
	protected string $sessionKey = '';
	protected ?\DateTime $createdAt = null;

	public function __construct() {
		// add types in constructor
		$this->addType('sessonKey', 'string');
		$this->addType('createdAt', 'datetime');
	}

	public function jsonSerialize(): array {
		return [
			'id' => $this->id,
			'sessionKey' => $this->sessionKey,
		];
	}
}
