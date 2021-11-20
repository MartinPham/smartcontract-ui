#!/bin/sh -
. $(dirname "$0")/env.sh

echo "[RELEASE] Clean released files ($RELEASE_DIR)"
rm -rf $RELEASE_DIR
echo "[RELEASE] Cleaned"

echo "[RELEASE] Pushing current working tree.."
(git add -A ; git commit -m "Manual build" ; git push origin $GIT_BRANCH) || (echo "Working tree clean")
echo "[RELEASE] Pushed ($GIT_BRANCH/$GIT_COMMIT).."

. $(dirname "$0")/build.sh
if [ -z ${GITHUB_ACTOR+x} ]; then cp .gitlab-ci-manual.yml $BUILD_DIR/.gitlab-ci.yml; fi

echo "[RELEASE] Syncing build files from $GIT_BUILD_BRANCH.."
rm -rf $RELEASE_DIR
mkdir $RELEASE_DIR
mv .git $RELEASE_DIR/.git
cd $RELEASE_DIR ; git branch -D $GIT_BUILD_BRANCH ; (git checkout $GIT_BUILD_BRANCH) || (git checkout -b $GIT_BUILD_BRANCH) ; git stash && git stash drop; (git pull --depth 1 origin $GIT_BUILD_BRANCH --rebase --allow-unrelated-histories) || (echo "Build files synced") ; cd ..
echo "[RELEASE] Synced"

echo "[RELEASE] Pushing build files.."
mv $RELEASE_DIR/.git . ; rm -rf $RELEASE_DIR ; cp -r $BUILD_DIR $RELEASE_DIR ; mv .git $RELEASE_DIR/.git
cd $RELEASE_DIR ; touch .nojekyll ; git add -A ; git commit -m "Manual build $GIT_COMMIT" ; git push origin $GIT_BUILD_BRANCH ; git checkout $GIT_BRANCH ; git branch -D $GIT_BUILD_BRANCH ; cd ..
echo "[RELEASE] Pushed"

echo "[RELEASE] Switch back to $GIT_BRANCH.."
mv $RELEASE_DIR/.git .
echo "[RELEASE] Switched"
