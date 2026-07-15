<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org> and contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Migration;

use Closure;
use OCP\DB\Types;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

class Version1000Date20260715102000 extends SimpleMigrationStep
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

			if (!$table->hasColumn('write_users')) {
				$table->addColumn('write_users', Types::STRING, [
					'notnull' => false,
					'length' => 256,
				]);
			}
		}

		return $schema;
	}
}
