#!/bin/sh -

echo "[ENV] Set build dir"
export BUILD_DIR=.build

echo "[ENV] Set release dir"
export RELEASE_DIR=.release

echo "[ENV] Set git data"
export GIT_BRANCH=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)
export GIT_BUILD_BRANCH=$GIT_BRANCH-build
export GIT_COMMIT=$(git rev-parse --short HEAD)
