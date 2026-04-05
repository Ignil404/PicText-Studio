## 1. Dependencies and foundation

- [x] 1.1 Install `react-router-dom` and `html2canvas` packages
- [x] 1.2 Create `src/types/index.ts` with Template, TextElement, RenderRequest, RenderResponse, ApiError types
- [x] 1.3 Create `src/services/api.ts` with mock data and API interface (fetchTemplates, fetchTemplateById, renderImage, cancelRender)
- [x] 1.4 Create `src/index.css` with minimal reset and import in main.tsx

## 2. Routing setup

- [x] 2.1 Wrap App in BrowserRouter in `src/main.tsx`
- [x] 2.2 Rewrite `src/App.tsx` with Routes for `/` and `/editor/:id`
- [x] 2.3 Create `src/pages/HomePage.tsx` as empty page placeholder
- [x] 2.4 Create `src/pages/EditorPage.tsx` as empty page placeholder

## 3. Template gallery

- [x] 3.1 Create `src/hooks/useTemplates.ts` (fetch + derive categories + cache)
- [x] 3.2 Create `src/components/TemplateCard/index.tsx` + `TemplateCard.module.css`
- [x] 3.3 Create `src/components/TemplateGallery/index.tsx` + `TemplateGallery.module.css` (grid, category filter, loading/error states)
- [x] 3.4 Implement HomePage to use TemplateGallery and navigate to editor on selection
- [x] 3.5 Verify gallery renders at `/` with mock data and category filtering

## 4. Editor hooks and core

- [x] 4.1 Create `src/hooks/useEditor.ts` (TextElement CRUD, selection, position, render+export with AbortController)

## 5. Editor components

- [x] 5.1 Create `src/components/TextLayer/index.tsx` + `TextLayer.module.css` (draggable text overlays, percentage positioning)
- [x] 5.2 Create `src/components/Toolbar/index.tsx` + `Toolbar.module.css` (font, size, color, bold/italic, add text button)
- [x] 5.3 Create `src/components/ExportButton/index.tsx` + `ExportButton.module.css` (html2canvas PNG/JPEG export)
- [x] 5.4 Create `src/components/Editor/index.tsx` + `Editor.module.css` (composes TextLayer, Toolbar, ExportButton, canvas layout)
- [x] 5.5 Implement EditorPage to load template by ID and pass to Editor component
- [x] 5.6 Verify editor renders at `/editor/:id`, text can be added/dragged/styled, and export produces a file

## 6. Verification and polish

- [x] 6.1 Run `npx tsc --noEmit` — no errors
- [x] 6.2 Run `npm run build` — clean production build
- [x] 6.3 Update `index.html` title to project name
- [x] 6.4 Smoke test: navigate gallery → editor → add text → drag → style → export PNG
