<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptpad\Settings;

use OCP\IURLGenerator;
use OCP\Settings\IIconSection;

class AdminSection implements IIconSection {
	private IURLGenerator $urlGenerator;

	public function __construct(IURLGenerator $urlGenerator) {
		$this->urlGenerator = $urlGenerator;
	}

	public function getID() {
		return 'openincryptpad';
	}


	public function getName() {
		return 'CryptPad';
	}

	public function getPriority() {
		return 80;
	}

	/**
	 * @return The relative path to a an icon describing the section
	 */
	public function getIcon() {
		return $this->urlGenerator->imagePath('openincryptpad', 'app-dark.svg');
	}
}
