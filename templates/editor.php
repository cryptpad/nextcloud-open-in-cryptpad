<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

script('openincryptpad', 'openincryptpad-editor');
style('openincryptpad', 'editor');

if ($_['cspNonce']) {
	$nonce = $_['cspNonce'];  // For Nextcloud version >= 30
} else {
	$nonce = base64_encode($_['requesttoken']);  // For Nextcloud version < 30
}
?>

<script nonce="<?php p($nonce) ?>"><?php print_unescaped($_['infoScript']) ?></script>

<script nonce="<?php p($nonce) ?>"
	src="<?php p($_["apiUrl"]) ?>" type="text/javascript"></script>
<div id="unsaved-indicator">
	<?php p($l->t('Saving...')); ?>
</div>
<div id="error-indicator"></div>
<div id="editor-content"></div>
<a id="back-button">✕</a>
