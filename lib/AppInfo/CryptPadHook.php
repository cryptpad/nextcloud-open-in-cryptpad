<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: XWiki CryptPad Team <contact@cryptpad.org>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\OpenInCryptPad\AppInfo;

use OCP\AppFramework\Services\IInitialState;
use OCA\OpenInCryptPad\Service\SettingsService;

class CryptPadHook {
        private IInitialState $initialState;
        private SettingsService $settingsService;

        public function __construct(
                SettingsService $settingsService,
                IInitialState $initialState
        ) {
                $this->settingsService = $settingsService;
                $this->initialState = $initialState;
        }


        public function register() : void {
                $this->initialState->provideInitialState('enabledapps', $this->settingsService->getAvailableTypes());
        }
}

?>

