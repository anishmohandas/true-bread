# Admin Panel - Maintenance Screens TODO

## ✅ All Steps Completed

### Backend
- [x] Added `GET /api/admin/articles` endpoint (JWT protected) → returns 16 articles
- [x] Added `GET /api/admin/publications` endpoint (JWT protected) → returns 14 publications

### Frontend Service
- [x] Added `AdminArticle` interface to `src/app/services/admin.service.ts`
- [x] Added `AdminPublication` interface to `src/app/services/admin.service.ts`
- [x] Added `getArticles()` method to `src/app/services/admin.service.ts`
- [x] Added `getPublications()` method to `src/app/services/admin.service.ts`

### New Components
- [x] Created `AdminArticlesComponent` (`/admin/dashboard/articles`)
  - Table: title, author, category, date, language badge, featured badge
  - Search/filter by title, author, category
  - Inline delete confirmation dialog
  - "Upload New Article" button
- [x] Created `AdminPublicationsComponent` (`/admin/dashboard/publications`)
  - Card grid: cover image, title, issue number, month/year, PDF filename
  - Inline delete confirmation dialog
  - "Upload New Issue" button

### Module & Routing Updates
- [x] `admin.module.ts` — declared both new components
- [x] `admin-routing.module.ts` — added routes for `/articles` and `/publications`
- [x] `admin-dashboard.component.ts` — added 2 new nav items
- [x] `admin-dashboard.component.html` — added SVG icons for `list` and `upload`

### Verification
- [x] Angular build: ✅ Succeeded (admin lazy chunk: 99.4 KB)
- [x] Backend API: ✅ GET /api/admin/articles (16 articles)
- [x] Backend API: ✅ GET /api/admin/publications (14 publications)
- [x] Backend API: ✅ JWT auth working on all new endpoints

### Bug Fix
- [x] Fixed HTTP 304 (Not Modified) caching bug — browser was returning empty body on repeat requests
  - Added `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate` middleware to all admin routes
  - Backend now always returns HTTP 200 with full response body
  - File: `backend/src/routes/admin.routes.ts`

### Edit Feature (Articles & Publications)
- [x] Backend: `GET /api/admin/articles/:id` — fetch full article for edit form
- [x] Backend: `PUT /api/admin/articles/:id` — update article (optional new image)
- [x] Backend: `GET /api/admin/publications/:id` — fetch publication + highlights for edit form
- [x] Backend: `PUT /api/admin/publications/:id` — update publication (optional new PDF, replaces highlights)
- [x] Service: `getArticle(id)`, `updateArticle(id, formData)` added to `admin.service.ts`
- [x] Service: `getPublication(id)`, `updatePublication(id, formData)` added to `admin.service.ts`
- [x] `AdminArticleUploadComponent` — edit mode via `ActivatedRoute` param `:id`, pre-fills form, PUT on submit
- [x] `AdminPublicationUploadComponent` — edit mode via `:id`, pre-fills form, PDF optional in edit mode
- [x] `AdminArticlesComponent` — Edit button added, navigates to `/admin/dashboard/articles/edit/:id`
- [x] `AdminPublicationsComponent` — Edit button added, navigates to `/admin/dashboard/publications/edit/:id`
- [x] `admin-routing.module.ts` — added `articles/edit/:id` and `publications/edit/:id` routes
- [x] Publications table converted from card grid to data table (Title, Issue#, Month/Year, PDF, Published, Actions)
- [x] `btn-edit-sm` style added to both articles and publications SCSS
- [x] Upload forms: dynamic title/button text, Back button, loading state for edit mode

### Rich Text Editor (Quill) — Article Content
- [x] Installed `ngx-quill@20` + `quill` (Angular 16 compatible, `--legacy-peer-deps`)
- [x] Added `node_modules/quill/dist/quill.snow.css` to `angular.json` styles
- [x] Imported `QuillModule.forRoot()` in `admin.module.ts`
- [x] Replaced content `<textarea>` with `<quill-editor>` in `admin-article-upload.component.html`
- [x] Added `quillModules` toolbar config to `admin-article-upload.component.ts`
  - Toolbar: bold, italic, underline, strike, blockquote, H1/H2/H3, ordered/bullet lists, indent, font size, alignment, link, clear
- [x] Added Quill editor SCSS styles to `admin-article-upload.component.scss`
  - Custom border/focus/error states on `.quill-wrapper`
  - `::ng-deep` overrides for toolbar and editor area
  - Min-height 320px, custom placeholder color, blockquote styling
