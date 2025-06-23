import { generateUrl } from '@nextcloud/router';

// FIXME: Hack for single public file view since it is not attached to the fileslist
window.addEventListener('DOMContentLoaded', function () {
  const mime = $('#mimetype').val();
  const supportedMimetypes = [
    'application/x-drawio',
  ];

  if ($('#isPublic').val() === undefined || !supportedMimetypes.includes(mime)) {
    return;
  }

  const sharingToken = $('#sharingToken').val();
  const downloadUrl = generateUrl('/s/{token}/download', { token: sharingToken });

  console.log("WE'RE HERE BITCHASS");
});