# Spec: UI Redesign

## ADDED Requirements

### REQ-NEW-1: Tailwind CSS Integration
The frontend SHALL use Tailwind CSS v3.4 with custom theme (purple/pink/orange gradient palette, dark mode support, animation keyframes for float and pulse-glow).

### REQ-NEW-2: shadcn/ui Component Library
The frontend SHALL include 40+ shadcn/ui components (button, input, textarea, card, dialog, toast, sonner, select, slider, tabs, etc.) built on Radix UI primitives.

### REQ-NEW-3: Canvas Live Preview
The editor page SHALL render a live HTML5 canvas preview showing:
- Gradient/solid background from template definition
- Emoji decorations with position, size, rotation, opacity
- Text zones with font, size, color, shadow, stroke — updated in real-time as user types

### REQ-NEW-4: Session-Based Authentication
The frontend SHALL use `crypto.randomUUID()` persisted in `localStorage` for session identity, replacing Supabase Auth. This matches the backend's session-based history API.

### REQ-NEW-5: Server-Side Render Integration
The editor SHALL call `POST /api/render` with text blocks (absolute pixel coordinates) and download the resulting PNG. The response includes `image_url` for the rendered composite.

### REQ-NEW-6: History Page
A `/history` page SHALL display all renders for the current session via `GET /api/history/:session_id`, showing template name, date, and download link.

### REQ-NEW-7: 15 Template Definitions
The frontend SHALL ship with 15 template definitions across 5 categories:
- 💪 Motivation (3): Восход успеха, Сила воли, Мечтай громко
- 😈 Demotivators (2): Классический, Современный
- 🎉 Greetings (3): С Днём Рождения!, С Новым Годом!, С любовью
- 😂 Memes (3): Импакт мем, Жизненный мем, Когда всё по плану
- ✨ Quotes (2): Минималистичная цитата, Тёмная цитата
- 🤣 Reactions (2): Этот мем — ты, Ожидание vs Реальность

Each template includes: gradient background, text zones (with default text, font, size, color), emoji decorations.

### REQ-NEW-8: Docker Configuration
The frontend SHALL run as nginx:alpine serving the Vite production build, with nginx proxying `/api/` requests to the backend service.

## MODIFIED Requirements

### REQ-MOD-1: Frontend Service (docker-compose)
The `frontend` service in docker-compose.yml SHALL build from `./frontend` (new code). The old frontend SHALL be preserved as `frontend_old/` and served on port 5174 for reference.

### REQ-MOD-2: Backend Font Support
The backend `FONT_REGISTRY` SHALL include all 10 Google Fonts used by templates (Fredoka, Nunito, Pacifico, Lobster, Caveat, Permanent Marker, Satisfy, Comfortaa, Rubik Mono One, Inter), mapped to available `.ttf` files.

### REQ-MOD-3: Backend SVG Rendering
The backend render service SHALL support data URI image sources (SVG base64) by decoding and rasterising via `cairosvg` before applying text overlay with Pillow.

## REMOVED Requirements

### REQ-DEL-1: Supabase Authentication
The frontend SHALL NOT use Supabase Auth, OAuth, or any external identity provider. Auth and Profile pages become stubs.

### REQ-DEL-2: Supabase Storage
The frontend SHALL NOT upload rendered images to Supabase storage. Server render downloads directly via `POST /api/render` response.

### REQ-DEL-3: Public Share Links
The `/shared/:shareId` page becomes a stub — no public sharing in current scope.

### REQ-DEL-4: Obsolete Specs
The `canvas-editor` and `frontend-routing` specs in `openspec/specs/` are superseded by this change and removed.
