hkmfmn jjhb vjkcfjcfmjcjj jfkvkvkvkglgvkjjmvjjjjjjjjjjjjjjjjjjjjjjjjjviiiiii uub                vyvu                             n4 4 4cf 3 b b# True 4  3ubn c3e r ui            kiread Deployment0Runbook (VPS)

This file contains the **correct deployment sequence** for future releases, including:
- A **Critical‑Path Runbook** (fast, production-safe)
- A **Thorough Runbook** (full verification + rollback)

---

## 1) Critical‑Path Runbook (Fast, Production-Safe)

## A. Pre-checks (do not skip)

```bash
date
hostname
pm2 status
nginx -t
git ls-remote --symref https://github.com/anishmohandas/true-bread.git HEAD
```

---0
20
\4
3333333'21'
## B. Backe
nd Deploy (Safe Sequence)

```bash
BACKEND_DIR=/var/www/truebread-backend
REPO_URL=https://github.com/anishmohandas/true-bread.git

cd $BACKEND_DIR
git fetch --all
2222222


21'
[12
2
2
01'2'2''''2'
33333333322222233333333331000000000  bbbbbbbb                                                                                  n[lkjvcxgit checkout main
git reset --hard origin/main

# DB host fix (avoid localhost/IPv6 socket issues)
sed -i 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' .env
sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env

npm install

# Ensure local binaries are executable
find node_modules/.bin -type f -exec chmod +x {} \;

# Build safely
rm -rf dist
node node_modules/rimraf/dist/esm/bin.mjs dist
node node_modules/typescript/bin/tsc
npm run copy-assets

# PM2 restart
pm2 delete true-bread-backend || true
pm2 start dist/server.js --name true-bread-backend --cwd $BACKEND_DIR --update-env
pm2 save
```

---

## C. Frontend Deploy (Safe Sequence)

```bash
FRONTEND_SRC=/tmp/tb-frontend-deploy
FRONTEND_DST=/var/www/truebread-frontend
REPO_URL=https://github.com/anishmohandas/true-bread.git

cd /tmp
rm -rf $FRONTEND_SRC
git clone --depth 1 -b main $REPO_URL $FRONTEND_SRC
cd $FRONTEND_SRC

npm install
npm run build -- --configuration production

# IMPORTANT: copy browser/* CONTENTS into web root
mkdir -p $FRONTEND_DST
rm -rf $FRONTEND_DST/*
cp -r dist/true-bread/browser/* $FRONTEND_DST/

chown -R www-data:www-data $FRONTEND_DST
find $FRONTEND_DST -type d -exec chmod 755 {} \;
find $FRONTEND_DST -type f -exec chmod 644 {} \;
```

---

## D. Nginx Required Config (Must Match Deployed Paths)

File: `/etc/nginx/sites-available/truebread`

```nginx
server {
    listen 80;
    server_name thetruebread.com www.thetruebread.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name thetruebread.com www.thetruebread.com;

    ssl_certificate /etc/letsencrypt/live/thetruebread.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thetruebread.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/truebread-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload nginx:

```bash
nginx -t && systemctl reload nginx
```

---

## E. Critical-Path Verification (Must Pass)

```bash
# Frontend
curl -I https://thetruebread.com/
curl -I https://thetruebread.com/index.html

# Static assets
curl -I https://thetruebread.com/styles-Z2NQX45Q.css
curl -I https://thetruebread.com/main-7EVCM7NV.js

# API via nginx
curl -sS https://thetruebread.com/api/health | head -c 400; echo
curl -sS https://thetruebread.com/api/articles/featured | head -c 400; echo

# Process/log checks
pm2 status
tail -n 40 /var/log/nginx/error.log
pm2 logs true-bread-backend --lines 40 --nostream
```

If all checks are good, deployment is complete.

---

## 2) Thorough Runbook (Critical‑Path + Full Coverage)

Run all critical-path steps first, then continue below.

## A. Full API Test Matrix

```bash
# Core
curl -i https://thetruebread.com/api/health
curl -i https://thetruebread.com/api/publications
curl -i https://thetruebread.com/api/articles/featured
curl -i https://thetruebread.com/api/editorial/latest

# Valid article
curl -i https://thetruebread.com/api/articles/seven-symbols-crucifixion

# Invalid article (expect handled 404/error)
curl -i https://thetruebread.com/api/articles/does-not-exist-xyz

# Wrong methods (expect 404/405 based on route implementation)
curl -i -X POST https://thetruebread.com/api/health
curl -i -X DELETE https://thetruebread.com/api/publications
```

Validation points:
- Correct status codes
- Correct JSON structure (`status`, `data`, errors)
- No HTML error bodies from API routes
- No new 502/500 in nginx logs

---

## B. Full UI Test Matrix (Manual)

Test these sections end-to-end:
1. Home page render and scrolling
2. Header/menu links
3. Latest Issue section
4. Publications listing
5. Featured articles
6. Article detail pages
7. Editorial section
8. Subscription form (valid + invalid input)
9. Contact form (valid + invalid input)
10. Admin login page validation behavior

For each page:
- Hard refresh
- Scroll full page
- Click visible CTAs/links
- Confirm no critical browser console errors

---

## C. SQL Content Deployment (Issue + Articles)

Example:

```bash
mysql -u <db_user> -p truebread < /var/www/truebread-backend/scripts/insert-mar-2026-issue.sql
mysql -u <db_user> -p truebread < /var/www/truebread-backend/scripts/insert-seven-symbols-of-the-crucifixion.sql
```

Post-insert checks:

```bash
curl -sS https://thetruebread.com/api/publications | head -c 800; echo
curl -sS https://thetruebread.com/api/articles/seven-symbols-crucifixion | head -c 800; echo
```

---

## 3) Rollback Procedure

## A. Backend Rollback

```bash
cd /var/www/truebread-backend
git reflog --oneline -n 10
git reset --hard <last-good-commit>
npm install
node node_modules/typescript/bin/tsc
npm run copy-assets
pm2 restart true-bread-backend --update-env
```

## B. Frontend Rollback

```bash
rm -rf /var/www/truebread-frontend/*
cp -r /var/www/truebread-frontend.backup/* /var/www/truebread-frontend/
chown -R www-data:www-data /var/www/truebread-frontend
nginx -t && systemctl reload nginx
```

## C. Emergency Stabilization

```bash
pm2 status
nginx -t
curl -I https://thetruebread.com/
curl -sS https://thetruebread.com/api/health
```

---

## 4) Known Pitfalls (Read Before Every Deploy)

1. Do **not** use `master` unless explicitly confirmed; current default branch is `main`.
2. If deploying `dist/true-bread/browser/*`, nginx root must be `/var/www/truebread-frontend`.
3. Keep API proxy as `proxy_pass http://127.0.0.1:3000;` under `/api/`.
4. Never empty frontend webroot unless build artifacts are ready to copy.
5. Verify with curls immediately after deploy.
6. If you see `rewrite or internal redirection cycle`, re-check nginx `root` + `try_files` immediately.

---

## 5) Quick One-Command Critical Verification Block

```bash
date
pm2 status
nginx -t
curl -I https://thetruebread.com/
curl -I https://thetruebread.com/index.html
curl -sS https://thetruebread.com/api/health | head -c 300; echo
curl -sS https://thetruebread.com/api/articles/featured | head -c 300; echo
tail -n 30 /var/log/nginx/error.log
```

If this block is clean, production is healthy.
