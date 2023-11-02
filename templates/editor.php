<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

script('openincryptpad', 'openincryptpad-editor');
style('openincryptpad', 'editor');
?>

<script nonce="<?php p(base64_encode($_['requesttoken'])) ?>">
window.OpenInCryptPadInfo = <?php print_unescaped($_['info']) ?>
</script>

<script nonce="<?php p(base64_encode($_['requesttoken'])) ?>"
	src="<?php p($_["apiUrl"]) ?>" type="text/javascript"></script>
<div id="unsaved-indicator">
	<?php p($l->t('Saving...')); ?>
</div>
<div id="error-indicator"></div>
<div id="editor-content"></div>
<a id="back-button">✕</a>
