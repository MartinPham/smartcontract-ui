#!/bin/sh -
. $(dirname "$0")/env.sh

yarn install --prefer-offline --pure-lockfile --cache-folder .yarn --modules-folder node_modules

echo "[BUILD] Clean built files ($BUILD_DIR)"
rm -rf $BUILD_DIR
echo "[BUILD] Cleaned"

echo "[BUILD] Building"
yarn build
echo "[BUILD] Built"

echo "[BUILD] Copy runtime files"
mv out $BUILD_DIR
echo "[BUILD] Copied"
