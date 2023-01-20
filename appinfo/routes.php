<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\OpenInCryptpad\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
	'routes' => [
		['name' => 'cryptpad_session#get', 'url' => '/session/{id}', 'verb' => 'GET'],
		['name' => 'cryptpad_session#put', 'url' => '/session/{id}', 'verb' => 'PUT'],
		['name' => 'settings#getCryptPadUrl', 'url' => '/settings/cryptPadUrl', 'verb' => 'GET'],
		['name' => 'settings#setCryptPadUrl', 'url' => '/settings/cryptPadUrl', 'verb' => 'PUT'],
		['name' => 'editor#page', 'url' => '/editor', 'verb' => 'GET'],
	]
];
