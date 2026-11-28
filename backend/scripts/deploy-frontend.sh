#!/usr/bin/env bash
#
# deploy-frontend.sh: build the frontend from GitHub (main) and publish it to the
# nginx web root, keeping admin uploads and reverting automatically if the site
# does not pass its checks afterwards.
#
# Run on the VPS as root:
#   sudo bash /var/www/truebread-backend/scripts/deploy-frontend.sh
#
# What it does:
#   1. Clones main into /tmp and builds it. Any failure here stops the script;
#      the live site is not touched.
#   2. Runs check-upload-setup.sh (skip with SKIP_UPLOAD_CHECK=1). A failure
#      stops the script; the live site is not touched.
#   3. Backs up the web root to /var/www/truebread-frontend.backup.
#   4. Copies the new build in with rsync. It never empties the web root:
#      admin uploads in assets/images/articles/ and assets/files/ exist only
#      on the server and are protected from deletion.
#   5. Sets permissions, tests and reloads nginx, then checks the live site.
#   6. If any of that fails, it restores the backup (uploads are kept), reloads
#      nginx and checks the site again.
#
# Exit codes: 0 deployed and checks passed
#             1 stopped before deploying (live site unchanged)
#             2 deploy failed its checks and was reverted (site restored)
#             3 deploy failed AND the revert failed: act now (see the message)
#
# Settings (override as environment variables):
REPO_URL="${REPO_URL:-https://github.com/anishmohandas/true-bread.git}"
BRANCH="${BRANCH:-main}"
WEBROOT="${WEBROOT:-/var/www/truebread-frontend}"
BACKUP_DIR="${BACKUP_DIR:-/var/www/truebread-frontend.backup}"
BUILD_ROOT="${BUILD_ROOT:-/tmp/tb-frontend-deploy}"
SITE_URL="${SITE_URL:-https://thetruebread.com}"
CHECK_SCRIPT="${CHECK_SCRIPT:-$(dirname "$(readlink -f "$0")")/check-upload-setup.sh}"
SKIP_UPLOAD_CHECK="${SKIP_UPLOAD_CHECK:-0}"
SKIP_NGINX="${SKIP_NGINX:-0}"   # for testing away from the server only

set -uo pipefail

BUILD_OUT="$BUILD_ROOT/dist/true-bread/browser"

step() { echo; echo "==> $*"; }
ok()   { echo "    OK: $*"; }
bad()  { echo "    FAILED: $*"; }
stop() { echo; echo "STOPPED: $*"; echo "The live site was not changed."; exit 1; }

# Copy a build into the web root without emptying it. --delete removes files
# that are not in the new build, but the P (protect) rules stop it deleting
# anything in the admin upload folders (article images, issue PDFs, issue covers).
publish() { # $1 = source folder
  rsync -a --delete \
    --filter='P /assets/images/articles/**' \
    --filter='P /assets/files/**' \
    --filter='P /assets/images/covers/**' \
    "$1/" "$WEBROOT/"
}

set_permissions() {
  chown -R www-data:www-data "$WEBROOT" &&
  find "$WEBROOT" -type d -exec chmod 755 {} + &&
  find "$WEBROOT" -type f -exec chmod 644 {} +
}

reload_nginx() {
  [ "$SKIP_NGINX" = "1" ] && return 0
  nginx -t && systemctl reload nginx
}

# Checks the live site. Returns non-zero if anything a visitor needs is broken.
check_site() {
  local failed=0 status body bundle

  if [ -f "$WEBROOT/index.html" ]; then ok "index.html is in place"; else bad "index.html is missing"; failed=1; fi

  status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL/?v=$(date +%s)")"
  body="$(curl -s --max-time 20 "$SITE_URL/?v=$(date +%s)")"
  if [ "$status" = "200" ] && printf '%s' "$body" | grep -q '<app-root'; then
    ok "home page loads ($SITE_URL, HTTP $status)"
  else
    bad "home page: HTTP $status, or the page is not the app"; failed=1
  fi

  # The main JavaScript bundle named in the live index.html must load,
  # or visitors get a blank page.
  bundle="$(printf '%s' "$body" | grep -o 'src="main-[A-Za-z0-9]*\.js"' | head -1 | cut -d'"' -f2)"
  if [ -z "$bundle" ]; then
    bad "could not find the main script in the home page"; failed=1
  else
    status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL/$bundle")"
    if [ "$status" = "200" ]; then ok "main script loads ($bundle)"; else bad "main script $bundle: HTTP $status"; failed=1; fi
  fi

  # An article page route must serve the app too (nginx try_files fallback)
  status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL/articles")"
  if [ "$status" = "200" ]; then ok "page routes work (/articles)"; else bad "/articles: HTTP $status"; failed=1; fi

  # The API is the backend's job; reverting the frontend would not fix it, so warn only
  status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL/api/health")"
  if [ "$status" = "200" ]; then ok "API responds (/api/health)"; else echo "    WARNING: /api/health returned HTTP $status (backend issue, not reverted)"; fi

  return $failed
}

echo "True Bread frontend deploy  ($(date))"
echo "Branch: $BRANCH   Web root: $WEBROOT   Site: $SITE_URL"

[ "$(id -u)" -eq 0 ] || stop "run this as root: sudo bash $0"
command -v rsync >/dev/null 2>&1 || stop "rsync is not installed (apt-get install -y rsync)"

# ── 1. Build ────────────────────────────────────────────────────────────────
step "Cloning $BRANCH and building"
rm -rf "$BUILD_ROOT"
git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$BUILD_ROOT" || stop "git clone failed"
cd "$BUILD_ROOT" || stop "cannot enter $BUILD_ROOT"
[ -f package.json ] && [ -f angular.json ] || stop "$BUILD_ROOT is not the Angular project root"
npm install || stop "npm install failed"
npm run build -- --configuration production || stop "the build failed"
[ -f "$BUILD_OUT/index.html" ] || stop "the build produced no $BUILD_OUT/index.html"
ok "built $(git rev-parse --short HEAD): $(git log -1 --format=%s)"

# ── 2. Upload setup check ───────────────────────────────────────────────────
if [ "$SKIP_UPLOAD_CHECK" = "1" ]; then
  step "Skipping the upload setup check (SKIP_UPLOAD_CHECK=1)"
elif [ ! -f "$CHECK_SCRIPT" ]; then
  step "Upload setup check not found at $CHECK_SCRIPT, skipping"
else
  step "Checking the upload setup"
  BUILD_DIR="$BUILD_OUT" WEBROOT="$WEBROOT" SITE_URL="$SITE_URL" bash "$CHECK_SCRIPT" ||
    stop "the upload setup check failed (see above). Fix it, or re-run with SKIP_UPLOAD_CHECK=1 if you are sure."
fi

# ── 3. Backup ───────────────────────────────────────────────────────────────
step "Backing up $WEBROOT to $BACKUP_DIR"
mkdir -p "$WEBROOT"
rm -rf "$BACKUP_DIR.tmp"
cp -a "$WEBROOT" "$BACKUP_DIR.tmp" || stop "the backup failed"
rm -rf "$BACKUP_DIR" && mv "$BACKUP_DIR.tmp" "$BACKUP_DIR" || stop "could not move the backup into place"
ok "backup saved ($(find "$BACKUP_DIR" -type f | wc -l) files)"

# ── 4–5. Deploy and check ───────────────────────────────────────────────────
step "Publishing the new build"
deployed=1
publish "$BUILD_OUT"            || { bad "copying the build failed"; deployed=0; }
[ $deployed = 1 ] && { set_permissions || { bad "setting permissions failed"; deployed=0; }; }
[ $deployed = 1 ] && { reload_nginx    || { bad "nginx config test or reload failed"; deployed=0; }; }

if [ $deployed = 1 ]; then
  step "Checking the live site"
  sleep 2
  if check_site; then
    echo
    echo "DEPLOYED: all checks passed."
    echo "Backup of the previous version: $BACKUP_DIR"
    exit 0
  fi
fi

# ── 6. Revert ───────────────────────────────────────────────────────────────
step "Deploy failed: restoring the backup"
reverted=1
publish "$BACKUP_DIR" || { bad "restoring the backup files failed"; reverted=0; }
set_permissions       || { bad "setting permissions failed"; reverted=0; }
reload_nginx          || { bad "nginx config test or reload failed"; reverted=0; }

step "Checking the live site after the revert"
sleep 2
if [ $reverted = 1 ] && check_site; then
  echo
  echo "REVERTED: the new build failed its checks, and the previous version is back and working."
  echo "Admin uploads were kept. The failed build is still in $BUILD_OUT for investigation."
  exit 2
fi

echo
echo "URGENT: the deploy failed and the site still fails its checks after the revert."
echo "The previous version is in $BACKUP_DIR. Check nginx (nginx -t, /var/log/nginx/error.log)."
echo "To restore by hand:"
echo "  rsync -a --delete --filter='P /assets/images/articles/**' --filter='P /assets/files/**' --filter='P /assets/images/covers/**' $BACKUP_DIR/ $WEBROOT/"
echo "  chown -R www-data:www-data $WEBROOT && nginx -t && systemctl reload nginx"
exit 3
