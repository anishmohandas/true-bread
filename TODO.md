# Admin Component + CKEditor TODO

## Completed Steps

- [x] 1. Angular 16→20 upgrade — `application` builder, TypeScript 5.8, zone.js 0.15
- [x] 2. All 32 components/pipes — `standalone: false` added
- [x] 3. Admin module created — login, dashboard, subscribers, articles, publications, upload
- [x] 4. Backend admin routes — JWT auth, subscriber list, article/publication CRUD
- [x] 5. Hide header/footer/nav-ball on admin routes — `isAdminRoute` in `app.component.ts`
- [x] 6. CKEditor 5 integration — installed `ckeditor5`, `@ckeditor/ckeditor5-angular`
- [x] 7. Updated `admin-article-upload` — replaced contenteditable with `<ckeditor>`
- [x] 8. Added `ckeditor5/ckeditor5.css` to `angular.json` styles
- [x] 9. `admin.module.ts` — imports `CKEditorModule`

## Pending

- [x] 10. Build verified — `Application bundle generation complete` ✅
- [ ] 11. Test admin panel in browser
- [ ] 12. Start dev server and verify admin routes work end-to-end
