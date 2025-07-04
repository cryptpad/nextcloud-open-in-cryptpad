import { generateUrl } from '@nextcloud/router';
import {
	DefaultType,
	FileAction,
	registerFileAction,
} from '@nextcloud/files'

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

// window.addEventListener('DOMContentLoaded', function () {
//   const mime = $('#mimetype').val();
//   const supportedMimetypes = [
//     'application/x-drawio',
//   ];

//   if ($('#isPublic').val() === undefined || !supportedMimetypes.includes(mime)) {
//     return;
//   }

//   const sharingToken = $('#sharingToken').val();
//   const downloadUrl = generateUrl('/s/{token}/download', { token: sharingToken });

//   console.log(downloadUrl)

//   const backLink = '' // TODO? currently doesn't work in shared
//   const fileName = $('#filename').val()
//   var fileid = 138
//   // change the file id????

//   try {
//       openInCryptPad(fileid, downloadUrl, mime, backLink, 'true', fileName)
//     } catch (c) {
//       showError(t('openincryptpad', 'File could not be created'))
//     }
// });


const cryptPadIconn = `<svg  viewBox="0 0 24 24" width="20" height="20"></svg>`;
const mimeTypes = ['application/x-drawio']
var firstTime = true
for (const mimeType of mimeTypes) {
  registerFileAction(new FileAction({
    id: 'edit-cryptpad-file',
    displayName() { return t('openincryptpad', 'Open in CryptPad') },
    iconSvgInline() { return cryptPadIconn },
    enabled(nodes) {
      return nodes.length === 1 && nodes[0].mime === mimeType
    },
    async exec(node, view, dir) {
      if (firstTime) {
					firstTime = false
					return true
				}
       const backLink = '' // TODO? currently doesn't work in shared
				// since we don't have access to the filepath in the drive, we use
				// the link for downloading the file
				const currentUrl = new URL(window.location.href)
				const shareToken = currentUrl.pathname.split('/').pop()
				const downloadUrl = `${currentUrl.origin}/index.php/s/${shareToken}/download`
				// console.log(node.fileid)
				openInCryptPad(node.fileid, downloadUrl, node.mime, backLink, 'true', node.displayname)
				return true
    },
    default: DefaultType.DEFAULT,
  }))
}