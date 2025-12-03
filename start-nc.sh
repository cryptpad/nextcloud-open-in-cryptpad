#!/usr/bin/env sh

set -ex

is_nc_installed() {
    ./occ status | grep 'installed: true'
    return $?
}

cp mimetype*.json config

# sleep 10

if ! is_nc_installed; then
    ./occ maintenance:install --admin-pass Test1234
fi

./occ app:enable openincryptpad

php -S 0.0.0.0:8080
