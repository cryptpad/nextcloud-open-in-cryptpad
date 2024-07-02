<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\Migration;

use Closure;
use OCP\DB\Types;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

class Version000000Date20181013124731 extends SimpleMigrationStep {
	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 * @return null|ISchemaWrapper
	 */
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
		/** @var ISchemaWrapper $schema */
		$schema = $schemaClosure();

		if (!$schema->hasTable('openincryptpad')) {
			$table = $schema->createTable('openincryptpad');
			$table->addColumn('id', Types::INTEGER, [
				'notnull' => true,
			]);
			$table->addColumn('session_key', Types::STRING, [
				'notnull' => true,
				'length' => 64
			]);
			$table->addColumn('created_at', Types::DATETIME, [
				'notnull' => true
			]);

			$table->setPrimaryKey(['id']);
		}
		return $schema;
	}
}
