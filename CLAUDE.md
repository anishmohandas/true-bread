# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

True Bread is a monthly Christian magazine website (thetruebread.com). It has an Angular 20 frontend (repo root, `src/`) and an Express + MySQL backend (`backend/`). Production runs on a VPS: nginx serves the built frontend and proxies `/api/` to the backend on `127.0.0.1:3000`, which runs under PM2 as `true-bread-backend`.

## Commands

Frontend (repo root):
- `npm start`: dev server on http://localhost:4200 (calls the API at `http://localhost:3000/api`)
- `npm run build`: production build (production is the default configuration) to `dist/true-bread/browser/`
- `npm test`: Karma. There are almost no specs, so there is no real test suite. To run one spec: `npx ng test true-bread --include src/app/path/to/file.spec.ts`
- `npm run clean`: clears `.angular/cache` and `dist`

Backend (`backend/`):
- `npm run dev`: ts-node-dev with reload on `src/server.ts`
- `npm run build:prod`: cleans, compiles and runs `copy-assets` (copies the EJS email templates into `dist/`). A plain `npm run build` skips the templates, so emails break.
- `npm run pm2:restart` / `npm run pm2:logs`: manage the production process (`ecosystem.config.js`)
- `npm run test:connection`: checks MySQL connectivity
- Configuration comes from `backend/.env` (`DB_*`, `EMAIL_*`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ALLOWED_ORIGINS`, `BASE_URL`, `FRONTEND_ASSETS_DIR`). See `backend/src/config/index.ts`.
- Admin uploads (article images, issue PDFs) are written to `FRONTEND_ASSETS_DIR` (`images/articles/`, `files/`): the live frontend web root's `assets` folder in production (`/var/www/truebread-frontend/assets`), `src/assets` locally by default. Those uploaded files exist only on the server, so frontend deploys must not wipe them (see the runbook).

Deployment is manual. `DEPLOYMENT_RUNBOOK.md` is the current, authoritative guide. The other `DEPLOYMENT_*.md` and `backend/*_DEPLOYMENT.md` files are older.

Legacy material you can ignore: `CODEBASE_INDEX.md` (from 2025) and `README.md` (Angular CLI boilerplate).

## Architecture

- **Backend entry point is `backend/src/server.ts`.** Routes:
  - Public, read-only: `/api/articles` (also `/featured` and `/:id`), `/api/publications` (also `/latest` and `/:id`), `/api/editorials` (also `/latest` and `/:id`)
  - `/api/subscribers` (rate-limited) and `/api/email/contact`
  - `/api/health`
  - `/api/admin/*`: JWT-protected CRUD with multer uploads (`middleware/auth.middleware.ts`)
- **Layering:** controllers/routes call `repositories/*.repository.ts`, which run raw SQL through the `mysql2/promise` pool in `db.ts`. There is no ORM. Repositories map snake_case columns to camelCase objects, and responses take the shape `{ status, data }`. The `pg` dependency and `cron/newsletter.cron.ts` are not wired in.
- **Frontend** is NgModule-based, not standalone: `app.module.ts` and `app-routing.module.ts`, with the admin area lazy-loaded from `components/admin/admin.module.ts` and protected by `guards/admin-auth.guard.ts`. Services in `src/app/services/` call `environment.apiUrl` (`/api` in prod). Interfaces live in `src/app/shared/interfaces/`. Styling uses Tailwind plus SCSS. Animations use GSAP and Lenis.
- **Bilingual articles:** articles have a `language` field (`'en'` or `'ml'`) and parallel `*Ml` fields (`titleMl`, `contentMl`, and so on). `ArticleService.transformArticle` swaps these in for Malayalam articles.

## Content workflow (most common task)

New monthly issues and articles are added by committing a SQL script plus static assets, not through the admin UI. Copy the existing scripts in `backend/scripts/`:

- **Issue:** `insert-<mon>-<yyyy>-issue.sql` inserts one row into `publications` (`id` like `october-2026`, `issue_number` incremented from the previous issue) and rows into `publication_highlights`. Highlight `id` values are global and sequential, so continue from the highest existing id. It needs `src/assets/files/TrueBread_<Mon>_<yyyy>.pdf` and `src/assets/images/covers/<mon><yy>_cover.jpg`. Optional highlight images go in `src/assets/images/highlights/<month-yyyy>/`.
- **Article:** `insert-<slug>.sql` inserts into `articles`, `article_images` and `article_tags`. The article `id` is the URL slug, and `image_url` points to `assets/images/articles/<slug>.jpg`. Wrap the statements in `DELIMITER $$ … DELIMITER ;` because article bodies contain semicolons. Escape single quotes by doubling them (`''`). `content` is either Quill HTML (if it starts with `<`) or plain text. Plain text is rendered by `ArticleDetailComponent.getFormattedContent`, which treats each non-empty line as an element: `1. ` lines become `<li>`, lines wrapped in straight `"` quotes become `<blockquote>`, and short English lines ending in `:` become `<h3>`. Everything else is `<p>`.
- Image and PDF paths are relative Angular asset paths, served by the frontend build rather than the backend. Content only appears in production after both the frontend redeploy and the SQL run (`mysql -u <user> -p truebread < script.sql`).

Database schema references: `backend/src/db/create_database_mysql.sql` and `backend/src/db/migrations/`.
