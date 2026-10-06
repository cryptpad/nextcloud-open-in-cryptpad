<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: 2026 XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

class Version1000Date20261006070810 extends SimpleMigrationStep
{
	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 * @return null|ISchemaWrapper
	 */
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options)
	{
		/** @var ISchemaWrapper $schema */
		$schema = $schemaClosure();

		if ($schema->hasTable('openincryptpad')) {
			$table = $schema->getTable('openincryptpad');

			$table->modifyColumn('session_key', [
				'notnull' => true,
				'length' => 128,
			]);
		}

		return $schema;
	}
}
