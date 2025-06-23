import { generateUrl } from '@nextcloud/router';

function openInCryptPad(fileId, filePath, mimeType, backLink, isShared, fileName) {
	location.href = generateUrl('/apps/openincryptpad/editor?id={id}&path={path}&mimeType={mimeType}&back={back}&isShared={isShared}&fileName={fileName}', {
		id: fileId,
		path: filePath,
		mimeType,
		back: backLink,
		isShared, 
		fileName
	})
}

window.addEventListener('DOMContentLoaded', function () {
  const mime = $('#mimetype').val();
  const supportedMimetypes = [
    'application/x-drawio',
  ];

  if ($('#isPublic').val() === undefined || !supportedMimetypes.includes(mime)) {
    return;
  }

  console.log("IT'S A DRAWIO I THINKS")
  const sharingToken = $('#sharingToken').val();
  const downloadUrl = generateUrl('/s/{token}/download', { token: sharingToken });

  console.log(downloadUrl)

  const backLink = '' // TODO? currently doesn't work in shared
  const fileName = $('#filename').val()
  // change the file id????
  openInCryptPad(35, downloadUrl, mime, backLink, 'true', fileName)
});