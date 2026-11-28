#!/usr/bin/env bash
#
# check-upload-setup.sh: checks, on the production server, that admin uploads
# (article images and issue PDFs) will be saved where nginx serves them and will
# survive frontend deploys.
#
# Run on the VPS as root:   sudo bash check-upload-setup.sh
#
# Safe to run on the live server:
#   * Part 1 tests the runbook's rsync command in a throwaway folder under /tmp.
#   * Part 2 is a dry run (rsync -n): it lists what a deploy WOULD change, changes nothing.
#   * Part 3 writes one small test file into each upload folder, checks it can be
#     read and served, then deletes it.
# It never prints secrets: from backend .env it reads only FRONTEND_ASSETS_DIR.
#
# Override defaults with environment variables if your paths differ, e.g.
#   sudo WEBROOT=/var/www/truebread-frontend BUILD_DIR=/tmp/tb-frontend-deploy/dist/true-bread/browser bash check-upload-setup.sh

set -u

WEBROOT="${WEBROOT:-/var/www/truebread-frontend}"
BACKEND_DIR="${BACKEND_DIR:-/var/www/truebread-backend}"
PM2_APP="${PM2_APP:-true-bread-backend}"
BUILD_DIR="${BUILD_DIR:-/tmp/tb-frontend-deploy/dist/true-bread/browser}"
SITE_URL="${SITE_URL:-https://thetruebread.com}"
UPLOAD_DIRS=("assets/images/articles" "assets/files" "assets/images/covers")

PASS=0; FAIL=0; WARN=0
pass() { echo "  [PASS] $*"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $*"; FAIL=$((FAIL + 1)); }
warn() { echo "  [WARN] $*"; WARN=$((WARN + 1)); }
info() { echo "         $*"; }
section() { echo; echo "== $* =="; }

# The exact deploy command from DEPLOYMENT_RUNBOOK.md, section C
deploy_rsync() { # $1 = source build dir, $2 = web root, extra args after
  local src="$1" dst="$2"; shift 2
  rsync -a --delete "$@" \
    --filter='P /assets/images/articles/**' \
    --filter='P /assets/files/**' \
    --filter='P /assets/images/covers/**' \
    "$src/" "$dst/"
}

echo "True Bread upload setup check  ($(date))"
echo "Web root: $WEBROOT   Backend: $BACKEND_DIR   PM2 app: $PM2_APP"

if [ "$(id -u)" -ne 0 ]; then
  warn "Not running as root. Parts 2 and 3 may be skipped or incomplete. Re-run with: sudo bash $0"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "Part 1: does the deploy rsync keep uploads? (sandbox in /tmp)"

if ! command -v rsync >/dev/null 2>&1; then
  fail "rsync is not installed. Install it with: apt-get install -y rsync"
else
  SANDBOX="$(mktemp -d /tmp/tb-upload-check.XXXXXX)"
  OLD="$SANDBOX/webroot"; NEW="$SANDBOX/build"
  mkdir -p "$OLD/assets/images/articles" "$OLD/assets/files" "$OLD/assets/data" \
           "$NEW/assets/images/articles" "$NEW/assets/files"

  # Current web root: an old build plus files uploaded through the admin
  echo "old index"        > "$OLD/index.html"
  echo "old bundle"       > "$OLD/main-OLD.js"                               # stale build file
  echo "stale data"       > "$OLD/assets/data/stale.json"                    # stale, not protected
  echo "old committed"    > "$OLD/assets/images/articles/committed.jpg"
  echo "uploaded image"   > "$OLD/assets/images/articles/uploaded-abc123.webp"
  echo "uploaded pdf"     > "$OLD/assets/files/TrueBread_Uploaded_2026.pdf"
  echo "old sep pdf"      > "$OLD/assets/files/TrueBread_Sep_2026.pdf"
  # The live web root holds an earlier deploy. Make these files older than the
  # new build, as in a real deploy: rsync skips files whose size and modified
  # time both match, and the old/new test files above have equal sizes.
  find "$OLD" -type f -exec touch -d '2 days ago' {} +

  # New build from git
  echo "new index"        > "$NEW/index.html"
  echo "new bundle"       > "$NEW/main-NEW.js"
  echo "new committed"    > "$NEW/assets/images/articles/committed.jpg"
  echo "new commit image" > "$NEW/assets/images/articles/added-in-git.jpg"
  echo "new sep pdf"      > "$NEW/assets/files/TrueBread_Sep_2026.pdf"

  if deploy_rsync "$NEW" "$OLD"; then
    check_has() { # file, expected content, label
      if [ -f "$OLD/$1" ] && [ "$(cat "$OLD/$1")" = "$2" ]; then pass "$3"; else fail "$3 ($1)"; fi
    }
    check_gone() { if [ ! -e "$OLD/$1" ]; then pass "$2"; else fail "$2 ($1 still there)"; fi; }

    check_has  "assets/images/articles/uploaded-abc123.webp"   "uploaded image"   "Uploaded article image survives the deploy"
    check_has  "assets/files/TrueBread_Uploaded_2026.pdf"      "uploaded pdf"     "Uploaded issue PDF survives the deploy"
    check_has  "index.html"                                    "new index"        "index.html is replaced by the new build"
    check_has  "main-NEW.js"                                   "new bundle"       "New build files are copied in"
    check_has  "assets/images/articles/committed.jpg"          "new committed"    "Images from git are updated"
    check_has  "assets/images/articles/added-in-git.jpg"       "new commit image" "New images from git are added"
    check_has  "assets/files/TrueBread_Sep_2026.pdf"           "new sep pdf"      "PDFs from git are updated"
    check_gone "main-OLD.js"                                   "Old build files are removed"
    check_gone "assets/data/stale.json"                        "Stale files outside the upload folders are removed"
  else
    fail "The rsync command itself failed (see the error above)"
  fi
  rm -rf "$SANDBOX"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "Part 2: dry run of a deploy against the real web root (changes nothing)"

if ! command -v rsync >/dev/null 2>&1; then
  warn "Skipped: rsync is not installed"
elif [ ! -d "$WEBROOT" ]; then
  fail "Web root $WEBROOT does not exist"
elif [ ! -f "$BUILD_DIR/index.html" ]; then
  warn "Skipped: no frontend build at $BUILD_DIR"
  info "To include this part: build the frontend as in runbook section C (stop before the rsync),"
  info "then re-run this script (or pass BUILD_DIR=<path to dist/true-bread/browser>)."
else
  info "Comparing build $BUILD_DIR"
  DRY="$(deploy_rsync "$BUILD_DIR" "$WEBROOT" -n -i 2>&1)"
  DELETES="$(printf '%s\n' "$DRY" | grep '^\*deleting' | sed 's/^\*deleting *//')"
  PROTECTED_DELETES="$(printf '%s\n' "$DELETES" | grep -E '^assets/(images/articles|images/covers|files)/' || true)"
  if [ -n "$PROTECTED_DELETES" ]; then
    fail "A real deploy WOULD delete files in the upload folders:"
    printf '%s\n' "$PROTECTED_DELETES" | sed 's/^/           /'
  else
    pass "A real deploy would not delete anything in the upload folders"
  fi
  N_DEL="$(printf '%s\n' "$DELETES" | grep -c . || true)"
  info "Files a real deploy would remove elsewhere (old build files): $N_DEL"
  for d in "${UPLOAD_DIRS[@]}"; do
    if [ -d "$WEBROOT/$d" ]; then
      ONLY_ON_SERVER="$(comm -23 <(ls -1 "$WEBROOT/$d" | sort) <(ls -1 "$BUILD_DIR/$d" 2>/dev/null | sort) | grep -c . || true)"
      info "$d: $ONLY_ON_SERVER file(s) exist only on the server (uploads, or files removed from git)"
    fi
  done
fi

# ─────────────────────────────────────────────────────────────────────────────
section "Part 3: can the backend save uploads that nginx can serve?"

# Where will the backend save uploads?
ENV_FILE=""
for f in "$BACKEND_DIR/.env" "$BACKEND_DIR/backend/.env"; do
  [ -f "$f" ] && { ENV_FILE="$f"; break; }
done
ASSETS_DIR=""
if [ -z "$ENV_FILE" ]; then
  warn "No .env found in $BACKEND_DIR or $BACKEND_DIR/backend"
else
  ASSETS_DIR="$(grep -E '^FRONTEND_ASSETS_DIR=' "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '"'"'"' \r')"
  if [ -n "$ASSETS_DIR" ]; then
    pass "FRONTEND_ASSETS_DIR is set in $ENV_FILE: $ASSETS_DIR"
    if [ "$(readlink -f "$ASSETS_DIR")" != "$(readlink -f "$WEBROOT/assets")" ]; then
      fail "It should point at the web root's assets folder: $WEBROOT/assets"
    fi
  else
    fail "FRONTEND_ASSETS_DIR is not set in $ENV_FILE"
    info "Add it with: echo 'FRONTEND_ASSETS_DIR=$WEBROOT/assets' >> $ENV_FILE"
    info "(the runbook's backend step does this), then restart: pm2 restart $PM2_APP --update-env"
  fi
fi
[ -z "$ASSETS_DIR" ] && ASSETS_DIR="$WEBROOT/assets"
info "Testing against: $ASSETS_DIR"

# Which user does the backend run as?
BACKEND_PID=""
if command -v pm2 >/dev/null 2>&1; then
  BACKEND_PID="$(pm2 pid "$PM2_APP" 2>/dev/null | tr -d '[:space:]')"
fi
if { [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "0" ]; } && command -v pgrep >/dev/null 2>&1; then
  BACKEND_PID="$(pgrep -f 'dist/server.js' | head -1)"
fi
if [ -n "${BACKEND_USER:-}" ]; then
  info "Backend user given as: $BACKEND_USER"
elif [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "0" ]; then
  warn "Could not find the running backend process; assuming it runs as root"
  BACKEND_USER="root"
else
  BACKEND_USER="$(ps -o user= -p "$BACKEND_PID" | tr -d ' ')"
  info "Backend process $BACKEND_PID runs as user: $BACKEND_USER"
  UMASK="$(awk '/^Umask:/ {print $2}' "/proc/$BACKEND_PID/status" 2>/dev/null)"
  if [ -n "$UMASK" ]; then
    # files are created 0666 & ~umask; "others" need read (4) for nginx unless it is in the group
    if [ $(( 0$UMASK & 4 )) -ne 0 ]; then
      warn "Backend umask is $UMASK: files it saves are not world-readable; nginx can read them only via group"
    else
      pass "Backend umask $UMASK lets nginx read the files it saves"
    fi
  fi
fi

# Which user does nginx serve files as?
if [ -z "${NGINX_USER:-}" ]; then
  NGINX_USER="$(awk '$1 == "user" {gsub(";", "", $2); print $2; exit}' /etc/nginx/nginx.conf 2>/dev/null)"
  NGINX_USER="${NGINX_USER:-www-data}"
fi
info "nginx serves files as user: $NGINX_USER"

as_user() { # user, command...
  local u="$1"; shift
  if [ "$(id -un)" = "$u" ]; then "$@"; elif [ "$(id -u)" -eq 0 ]; then sudo -u "$u" "$@"; else return 99; fi
}

TOKEN="upload-check-$(date +%s)-$RANDOM"
for d in images/articles files images/covers; do
  DIR="$ASSETS_DIR/$d"
  echo
  info "Folder: $DIR"
  if [ ! -d "$DIR" ]; then
    # The backend creates missing folders at start-up; check it could
    PARENT="$(dirname "$DIR")"; while [ ! -d "$PARENT" ]; do PARENT="$(dirname "$PARENT")"; done
    if as_user "$BACKEND_USER" test -w "$PARENT"; then
      warn "Does not exist yet; the backend will create it on start-up ($PARENT is writable)"
    else
      fail "Does not exist, and $BACKEND_USER cannot create it in $PARENT"
      info "Fix: mkdir -p $DIR && chown $BACKEND_USER:$NGINX_USER $DIR && chmod 755 $DIR"
    fi
    continue
  fi
  info "Owner and mode: $(stat -c '%U:%G %a' "$DIR")"

  TEST_FILE="$DIR/$TOKEN.txt"
  as_user "$BACKEND_USER" sh -c "echo '$TOKEN' > '$TEST_FILE'" 2>/dev/null
  RC=$?
  if [ $RC -eq 99 ]; then
    warn "Skipped write test: re-run as root to test as user $BACKEND_USER"
    continue
  elif [ $RC -ne 0 ] || [ ! -f "$TEST_FILE" ]; then
    fail "$BACKEND_USER cannot write here, so uploads to this folder will fail"
    info "Fix: chown $BACKEND_USER:$NGINX_USER $DIR && chmod 755 $DIR"
    continue
  fi
  pass "$BACKEND_USER can write here"

  as_user "$NGINX_USER" cat "$TEST_FILE" >/dev/null 2>&1
  RC=$?
  if [ $RC -eq 0 ]; then
    pass "$NGINX_USER can read files saved here"
  elif [ $RC -eq 99 ]; then
    warn "Skipped read test: re-run as root to test as user $NGINX_USER"
  else
    fail "$NGINX_USER cannot read files saved here (check the folder path permissions)"
    info "Path permissions: $(namei -m "$TEST_FILE" 2>/dev/null | tail -n +2 | awk '{print $1, $2}' | tr '\n' ' ')"
  fi

  # Fetch it through the live site. The site falls back to index.html for missing
  # files, so compare the body rather than trusting a 200.
  if [ "$(readlink -f "$ASSETS_DIR")" = "$(readlink -f "$WEBROOT/assets")" ] && command -v curl >/dev/null 2>&1; then
    BODY="$(curl -s --max-time 10 "$SITE_URL/assets/$d/$TOKEN.txt")"
    if [ "$BODY" = "$TOKEN" ]; then
      pass "The live site serves files saved here: $SITE_URL/assets/$d/"
    else
      fail "The live site does not serve files saved here ($SITE_URL/assets/$d/$TOKEN.txt)"
    fi
  fi

  as_user "$BACKEND_USER" rm -f "$TEST_FILE" 2>/dev/null || rm -f "$TEST_FILE"
  [ -e "$TEST_FILE" ] && warn "Could not delete test file $TEST_FILE; please remove it" || info "Test file removed"
done

# ─────────────────────────────────────────────────────────────────────────────
section "Summary"
echo "  $PASS passed, $FAIL failed, $WARN warnings"
[ "$FAIL" -eq 0 ] && echo "  Upload setup looks good." || echo "  Fix the FAIL items above, then run this again."
[ "$FAIL" -eq 0 ]
