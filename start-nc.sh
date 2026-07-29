#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

set -ex

is_nc_installed() {
    ./occ status | grep 'installed: true'
    return $?
}

create_update_user() {
    USERNAME=$1
    PASSWORD=Test1234
    if ./occ user:info "$USERNAME" > /dev/null 2>&1; then
        printf '%s\n%s\n' "$PASSWORD" "$PASSWORD" | ./occ user:resetpassword "$USERNAME"
    else
        printf '%s\n%s\n' "$PASSWORD" "$PASSWORD" | ./occ user:add "$USERNAME"
    fi
}

cp mimetype*.json config

# sleep 10

if ! is_nc_installed; then
    ./occ maintenance:install --admin-pass Test1234
fi

./occ app:enable openincryptpad

./occ app:disable password_policy
create_update_user user1
create_update_user user2

tail -n 0 -f /nextcloud/data/nextcloud.log &
php -S 0.0.0.0:8080 
