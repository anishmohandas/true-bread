#!/bin/bash
set -Eeuo pipefail

APP_DIR="/var/www/truebread-backend"
FRONTEND_DIR="/var/www/truebread-frontend"
BACKUP_DIR="$HOME/app-backups"
DATE="$(date +%Y%m%d_%H%M%S)"
REPO_URL="https://github.com/anishmohandas/true-bread.git"
PM2_PROCESS_NAME="true-bread-backend"

BACKEND_TMP="/tmp/temp-update-${DATE}"
FRONTEND_TMP="/tmp/temp-frontend-update-${DATE}"

BACKEND_BACKUP_PATH="$BACKUP_DIR/backup_${DATE}"
FRONTEND_BACKUP_PATH="$BACKUP_DIR/frontend_backup_${DATE}"

echo "=== True Bread Deployment Script (Detailed Debug + Hardened) ==="
echo "Starting deployment at: $(date)"
echo "App directory: $APP_DIR"
echo "Frontend directory: $FRONTEND_DIR"
echo "Backup directory: $BACKUP_DIR"

safe_dir_guard() {
  local target="$1"
  if [[ -z "${target:-}" || "$target" == "/" || "$target" == "/var" || "$target" == "/var/www" ]]; then
    echo "ERROR: Refusing unsafe directory operation on '$target'"
    exit 1
  fi
}

clean_dir_contents() {
  local target="$1"
  safe_dir_guard "$target"
  mkdir -p "$target"
  find "$target" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
}

copy_dir_contents() {
  local from="$1"
  local to="$2"
  mkdir -p "$to"
  cp -a "$from"/. "$to"/
}

cleanup_tmp() {
  rm -rf "$BACKEND_TMP" "$FRONTEND_TMP" 2>/dev/null || true
}

rollback_backend() {
  echo "Rolling back backend from backup..."
  if [[ -d "$BACKEND_BACKUP_PATH" ]]; then
    clean_dir_contents "$APP_DIR"
    copy_dir_contents "$BACKEND_BACKUP_PATH" "$APP_DIR"
    cd "$APP_DIR"
    pm2 restart "$PM2_PROCESS_NAME" || pm2 start dist/index.js --name "$PM2_PROCESS_NAME"
    echo "Backend rollback completed."
  else
    echo "WARNING: Backend backup path not found: $BACKEND_BACKUP_PATH"
  fi
}

rollback_frontend() {
  echo "Rolling back frontend from backup..."
  if [[ -d "$FRONTEND_BACKUP_PATH" ]]; then
    clean_dir_contents "$FRONTEND_DIR"
    copy_dir_contents "$FRONTEND_BACKUP_PATH" "$FRONTEND_DIR"
    chown -R www-data:www-data "$FRONTEND_DIR"
    find "$FRONTEND_DIR" -type d -exec chmod 755 {} \;
    find "$FRONTEND_DIR" -type f -exec chmod 644 {} \;
    echo "Frontend rollback completed."
  else
    echo "WARNING: Frontend backup path not found: $FRONTEND_BACKUP_PATH"
  fi
}

verify_url() {
  local url="$1"
  local expected="${2:-200}"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")"
  echo "Check $url -> HTTP $code (expected $expected)"
  [[ "$code" == "$expected" ]]
}

trap 'echo "ERROR: Deployment failed at line $LINENO"; cleanup_tmp' ERR
trap 'cleanup_tmp' EXIT

mkdir -p "$BACKUP_DIR"
safe_dir_guard "$APP_DIR"
safe_dir_guard "$FRONTEND_DIR"

echo "Creating backend backup..."
copy_dir_contents "$APP_DIR" "$BACKEND_BACKUP_PATH"
echo "Backend backup created at: $BACKEND_BACKUP_PATH"

echo "Creating frontend backup..."
copy_dir_contents "$FRONTEND_DIR" "$FRONTEND_BACKUP_PATH"
echo "Frontend backup created at: $FRONTEND_BACKUP_PATH"

# Ensure Node.js >= 20 is available (required by Angular 20 / Angular CLI)
echo "Checking Node.js version..."
NODE_VERSION="$(node -v 2>/dev/null || echo "not-found")"
echo "Current Node.js version: $NODE_VERSION"

export NVM_DIR="$HOME/.nvm"

if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  echo "NVM found, loading..."
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
else
  echo "NVM not found. Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
fi

echo "Installing/using Node.js v20 LTS..."
nvm install 20
nvm use 20
nvm alias default 20

echo "Node.js version after switch: $(node -v)"
echo "npm version: $(npm -v)"

# ============================================================
# BACKEND DEPLOYMENT
# ============================================================
echo ""
echo "=== Starting Backend Deployment ==="
cd "$APP_DIR"

echo "Cloning repository for backend..."
git clone "$REPO_URL" "$BACKEND_TMP"

if [[ -d "$BACKEND_TMP/backend" ]]; then
  echo "Backend directory found in repo, copying backend contents..."
  copy_dir_contents "$BACKEND_TMP/backend" "$APP_DIR"
else
  echo "No backend directory found in repo root, copying root contents..."
  copy_dir_contents "$BACKEND_TMP" "$APP_DIR"
fi

echo "Installing backend dependencies..."
npm install

echo "Rebuilding sharp native module..."
if ! dpkg -l | grep -q libvips-dev; then
  echo "Installing libvips-dev (required for sharp)..."
  apt-get update -y >/dev/null 2>&1 || true
  apt-get install -y libvips-dev >/dev/null 2>&1 || true
fi

rm -rf node_modules/sharp
npm install --unsafe-perm sharp || npm install @img/sharp-linux-x64 @img/sharp-libvips-linux-x64 || true

echo "Building backend..."
npm run build:prod

echo "Restarting backend with PM2..."
pm2 restart "$PM2_PROCESS_NAME" || pm2 start dist/index.js --name "$PM2_PROCESS_NAME"

echo "Waiting 10 seconds for backend startup..."
sleep 10

echo "Backend process status:"
pm2 status "$PM2_PROCESS_NAME" || true

echo "Backend health checks..."
BACKEND_HEALTH_OK=false
if verify_url "http://localhost:3000/api/health" "200"; then
  BACKEND_HEALTH_OK=true
elif verify_url "http://localhost:3000/health" "200"; then
  BACKEND_HEALTH_OK=true
fi

if [[ "$BACKEND_HEALTH_OK" != true ]]; then
  echo "Backend health checks failed."
  pm2 logs "$PM2_PROCESS_NAME" --lines 50 || true
  rollback_backend
  exit 1
fi

echo "Backend deployed successfully."

# ============================================================
# FRONTEND DEPLOYMENT
# ============================================================
echo ""
echo "=== Starting Frontend Deployment ==="

echo "Cloning repository for frontend build..."
git clone "$REPO_URL" "$FRONTEND_TMP"

cd "$FRONTEND_TMP"
echo "Installing frontend dependencies..."
npm install

echo "Building frontend for production..."
npm run build --configuration production

BUILD_OUTPUT_DIR="dist/true-bread/browser"
if [[ ! -d "$BUILD_OUTPUT_DIR" ]]; then
  echo "ERROR: Frontend build output not found at $BUILD_OUTPUT_DIR"
  rollback_frontend
  exit 1
fi

echo "Deploying frontend files..."
clean_dir_contents "$FRONTEND_DIR"
copy_dir_contents "$BUILD_OUTPUT_DIR" "$FRONTEND_DIR"

echo "Setting frontend permissions..."
chown -R www-data:www-data "$FRONTEND_DIR"
find "$FRONTEND_DIR" -type d -exec chmod 755 {} \;
find "$FRONTEND_DIR" -type f -exec chmod 644 {} \;

echo "Frontend deployment completed."

# ============================================================
# POST-DEPLOY VERIFICATION
# ============================================================
echo ""
echo "=== Post-Deploy Verification ==="
echo "Checking local and public endpoints..."

# Backend local checks
verify_url "http://localhost:3000/api/publications" "200" || {
  echo "WARNING: /api/publications local check failed"
}
verify_url "http://localhost:3000/api/articles/featured" "200" || {
  echo "WARNING: /api/articles/featured local check failed"
}

# Public checks (allow some flexibility depending on nginx/SSL)
verify_url "http://localhost/" "200" || verify_url "http://localhost/" "301" || {
  echo "WARNING: Frontend localhost check failed"
}

echo ""
echo "✅ Deployment completed."
echo "Backups:"
echo "  Backend:  $BACKEND_BACKUP_PATH"
echo "  Frontend: $FRONTEND_BACKUP_PATH"
echo "Finished at: $(date)"
