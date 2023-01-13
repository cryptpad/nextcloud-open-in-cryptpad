<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

script('openincryptpad', 'openincryptpad-settings');
style('openincryptpad', 'settings');
?>

<div class="settings-section">
	<div class="section">
		<h2 class="settings-section__title"><?php p($l->t('CryptPad Instance')); ?></h2>
		<h3><?php p($l->t('URL of the CryptPad instance to use for collaborative editing:')); ?></h3>
		<div class="cryptpad-url">
			<input id="openincryptpad-url" type="url" placeholder="https://">
			<a id="openincryptpad-save" class="button">
				<?php p($l->t('Save')); ?>
			</a>
		</div>
	</div>
</div>
