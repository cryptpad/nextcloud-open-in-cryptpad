<!--
SPDX-FileCopyrightText: Wolfgang Ginolas <wolfgang.ginolas@xwiki.com>
SPDX-License-Identifier: CC0-1.0
-->

# Open In CryptPad
## Install from binary release

1. Unpack `openincryptpad.tar.gz` in the **nextcloud/apps/** folder.
2. Enable the "Open in CryptPad" app in the Nextcloud admin page.
3. Configure "Open in CryptPad" in the administration settings of Nextcloud.
4. Add draw.io mimetype to Nextcloud. "Open in CryptPad" depends on Nextcloud
   detecting draw.io files correctly. For this you have to create the following
   files: (**Note:** do this before uploading any draw.io files! The mimetype of
   old files will not be updated by these changes)
    - `nextcloud/config/mimetypealiases.json`
``` json
{
    "application/x-drawio": "image"
}
```
    - `nextcloud/config/mimetypemapping.json`
``` json
{
    "drawio": ["application/x-drawio"]
}
```

## Clone from repo
Place this app in **nextcloud/apps/**. Make sure the folder is named `openincryptpad`. E.g.:

``` sh
cd nextcloud/apps
git clone https://github.com/cryptpad/nextcloud-open-in-cryptpad.git openincryptpad
```

## Building the app

The app can be built by using the provided Makefile by running:

    make

This requires the following things to be present:
* make
* which
* tar: for building the archive
* curl: used if phpunit and composer are not installed to fetch them from the web
* npm: for building and testing everything JS, only required if a package.json is placed inside the **js/** folder

The make command will install or update Composer dependencies if a composer.json is present and also **npm run build** if a package.json is present in the **js/** folder. The npm **build** script should use local paths for build systems and package managers, so people that simply want to build the app won't need to install npm libraries globally, e.g.:

**package.json**:
```json
"scripts": {
    "test": "node node_modules/gulp-cli/bin/gulp.js karma",
    "prebuild": "npm install && node_modules/bower/bin/bower install && node_modules/bower/bin/bower update",
    "build": "node node_modules/gulp-cli/bin/gulp.js"
}
```


## Publish to App Store

First get an account for the [App Store](http://apps.nextcloud.com/) then run:

    make && make appstore

The archive is located in build/artifacts/appstore and can then be uploaded to the App Store.

## Running tests
You can use the provided Makefile to run all tests by using:

    make test

This will run the PHP unit and integration tests and if a package.json is present in the **js/** folder will execute **npm run test**

Of course you can also install [PHPUnit](http://phpunit.de/getting-started.html) and use the configurations directly:

    phpunit -c phpunit.xml

or:

    phpunit -c phpunit.integration.xml

for integration tests
