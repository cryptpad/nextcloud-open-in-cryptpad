<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\OpenInCryptPad\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
	'routes' => [
		['name' => 'cryptPad_session#get', 'url' => '/session/{id}', 'verb' => 'GET'],
		['name' => 'cryptPad_session#put', 'url' => '/session/{id}', 'verb' => 'PUT'],
		['name' => 'settings#getCryptPadUrl', 'url' => '/settings/cryptPadUrl/{app}', 'verb' => 'GET'],
		['name' => 'settings#setCryptPadUrl', 'url' => '/settings/cryptPadUrl/{app}', 'verb' => 'PUT'],
		['name' => 'editor#page', 'url' => '/editor', 'verb' => 'GET'],
		['name' => 'share#image', 'url' => '/share/{token}', 'verb' => 'GET'],
	]
];
