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
		<h3><?php p($l->t('URLs of the CryptPad instances to use for collaborative editing:')); ?></h3>
		<p>
			<?php p($l->t('Documentation for this application can be found here:')); ?>
			<a href="https://github.com/cryptpad/nextcloud-open-in-cryptpad/blob/main/README.md">https://github.com/cryptpad/nextcloud-open-in-cryptpad/blob/main/README.md</a>
		</p>
		<div class="urls">
			<?php
				foreach ($_['urls'] as $app => $url) {
					?>
			<div class="url">
				<label for="<?php p("openincryptpad-url-$app"); ?>">
					<?php p($l->t($app)) ?>
				</label>
				<input
					id="<?php p("openincryptpad-url-$app"); ?>"
				    class="openincryptpad-url"
					value="<?php p($url); ?>"
					type="url"
					placeholder="https://">
			</div>
			<?php
				}
?>
		</div>
		<a id="openincryptpad-save" class="button">
			<?php p($l->t('Save')); ?>
		</a>
	</div>
</div>
