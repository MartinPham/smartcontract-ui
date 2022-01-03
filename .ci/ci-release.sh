#!/bin/sh -
. $(dirname "$0")/env.sh

echo "[CI-RELEASE] Preparing files.."
rm -rf $BUILD_DIR/.gitlab-ci.yml
mv public public-org
mv $BUILD_DIR public
echo "[CI-RELEASE] Done"
