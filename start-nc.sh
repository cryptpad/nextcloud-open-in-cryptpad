#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

set -ex

is_nc_installed() {
    until ./occ status > /tmp/occ-status
        do sleep 10
    done
    grep 'installed: true' /tmp/occ-status
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

# Maybe the database is not ready yet. Retry until it is
retry_if_fails() {
    until "$@"
        do sleep 10
    done
}

cp mimetype*.json config

if ! is_nc_installed; then
    retry_if_fails ./occ maintenance:install \
        --database pgsql \
        --database-name nextcloud \
        --database-host "$DB_HOST" \
        --database-user nextcloud \
        --database-pass postgres \
        --admin-pass Test1234
fi

retry_if_fails ./occ app:enable openincryptpad

./occ app:disable password_policy
create_update_user user1
create_update_user user2

tail -n 0 -f /nextcloud/data/nextcloud.log &
php -S 0.0.0.0:8080 
