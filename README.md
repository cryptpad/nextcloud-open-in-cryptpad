<!---
SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Open In CryptPad

"Open in CryptPad" is a Nextcloud application that allows collaborative editing
of files. For this it uses a CryptPad instance embedded into the Nextcloud web
interface. Currently, only drawio diagrams are supported.

## Importing images from Nextcloud into diagrams

With this app, you can import images from Nextcloud into
diagrams. A copy of the image will be stored inside the `.drawio` file.

## Rights management

When using this app, the file permissions are completely handled by
Nextcloud. The right's management of CryptPad is not used for Nextcloud
files edited in CryptPad.

## Installation

You can install this app in one of the following ways: either from the NextCloud app store, from a binary release, or by cloning this repository. Once installed, you can check CryptPad is configured correctly by checking that the url listed under Administration > CryptPad is the same as the url of your local CryptPad instance.

### Prerequisites on the CryptPad side

To embed CryptPad into Nextcloud, the "Enable remote embedding" admin setting
needs to be enabled. You can find this setting on the "Administration" web
interface in the "Security" tab.


### Install from Nextcloud app store

1. Add drawio mimetype to Nextcloud. "Open in CryptPad" depends on Nextcloud
   detecting drawio files correctly. For this you have to create the following
   files: (**Note:** do this before uploading any drawio files! The mimetype of
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
2. Open the "Apps" page in your Nextcloud web interface and install "Open in
   CryptPad". You can find it in the "Integration" category.
3. Configure "Open in CryptPad" in the administration settings of Nextcloud.

### Install from binary release

1. Unpack `openincryptpad.tar.gz` in the **nextcloud/apps/** folder. You can
   download the latest version from the [release
   page](https://github.com/cryptpad/nextcloud-open-in-cryptpad/releases).
2. Enable the "Open in CryptPad" app in the Nextcloud admin page.
3. Configure "Open in CryptPad" in the administration settings of Nextcloud.
4. Add drawio mimetype to Nextcloud. "Open in CryptPad" depends on Nextcloud
   detecting drawio files correctly. For this you have to create the following
   files: (**Note:** do this before uploading any drawio files! The mimetype of
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

#### Verify binary release

To verify the binary release you run the following command:

``` shell
openssl dgst -sha512 -verify openincryptpad.pubkey -signature openincryptpad.tar.gz.signature openincryptpad.tar.gz
```

### Clone from repo
Place this app in **nextcloud/apps/**. Make sure the folder is named `openincryptpad`. E.g.:

``` sh
cd nextcloud/apps
git clone https://github.com/cryptpad/nextcloud-open-in-cryptpad.git openincryptpad
```

## Building the app

Prior to building, install the requisite dependencies by running:

    npm ci


The app can then be built using the provided Makefile by running:

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

## Running the Nextcloud server

Before running Nextcloud, ensure you have an up-to-date version of PHP installed and run the following commands:

    git clone https://github.com/nextcloud/server.git nextcloud
    cd nextcloud/
    git switch v29.0.7 --detach
    git submodule update --init

Then, to run the server:

    php -S localhost:8080

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
