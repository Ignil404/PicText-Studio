# Design: UI Redesign — Replace MVP frontend with production-grade React app

## Problem
The MVP frontend (`frontend/`) uses minimal React + Vite with basic CSS — no component library, no Tailwind, no visual polish. It works but looks like a prototype.

## Solution
Migrate to a new frontend (`frontend/`, replacing old `frontend/` → `frontend_old/`) based on a modern stack:

- **React 18 + Vite + TypeScript** (kept from MVP)
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** — 40+ accessible Radix-based components
- **TanStack Query** for data fetching
- **Sonner** for toast notifications
- **Canvas-based live preview** with Pillow server-side render fallback

## Architecture

```
frontend/                    ← new (replaces old → frontend_old/)
├── src/
│   ├── pages/              — Index (gallery), Editor (canvas + panel), History, Auth/Profile (stubs)
│   ├── components/         — CanvasPreview, TemplateCard, EditorPanel, 40+ shadcn/ui
│   ├── data/               — 15 template definitions with gradients, text, emoji decorations
│   ├── hooks/              — useSession (localStorage UUID), useToast
│   ├── lib/                — session.ts (UUID v4)
│   └── types/              — template.ts (frontend schema)
├── Dockerfile              — node:22-alpine builder → nginx:alpine
├── nginx.conf              — SPA fallback + /api proxy to backend
├── tailwind.config.ts      — purple/pink/orange theme, animations
└── vite.config.ts          — port 5174 dev, /api proxy → :8000
```

## Key Decisions

### Auth replaced with Session UUID
- **Before**: Supabase Auth (email + Google OAuth)
- **After**: `crypto.randomUUID()` in localStorage — matches backend session-based history

### Canvas preview preserved
- Live HTML5 canvas preview renders gradient backgrounds + emoji decorations + text zones
- Text updates in real-time as user types
- Server render via `POST /api/render` → Pillow + cairosvg (SVG → PNG)

### Template data stays local (for now)
- Templates defined in `src/data/templates.ts` — 15 items with gradient backgrounds
- Each template has `backendId` mapping to UUID in database for server render
- Categories filter locally; no API call for template list (future: sync with backend)

### Stub pages for future auth
- `/auth` — placeholder: "Feature coming soon"
- `/profile` — shows current session ID
- `/shared/:shareId` — placeholder: public sharing not implemented

## Migration Path

1. Copy from reference project (`image-weaver/`)
2. Remove Supabase/Lovable integrations
3. Replace `useAuth` with `useSession` (localStorage UUID)
4. Add `backendId` to template definitions for server render
5. Update `Editor` to use `POST /api/render` instead of Supabase storage
6. Add `History` page using `GET /api/history/:session_id`
7. Configure Docker + nginx with `/api` proxy
8. Add cairosvg to backend for SVG data URI → PNG conversion
9. Download 10 Google Fonts for server-side rendering
10. Archive old `frontend/` as `frontend_old/`

## Risks

| Risk | Mitigation |
|------|-----------|
| SVG data URIs in DB not supported by Pillow | Added `cairosvg` for SVG → PNG rasterisation |
| Missing fonts on server | Downloaded 10 Google Fonts, mapped in `FONT_REGISTRY` |
| API schema mismatch | Frontend `textZones` use relative coords (0-1), backend uses absolute pixels — Editor sends absolute values |
| Build size bloat (40+ shadcn components) | Tree-shaking via Vite, final bundle ~397KB gzipped ~127KB |
