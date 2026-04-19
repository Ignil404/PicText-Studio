## Context

PicText Studio is an image creation tool with 9 templates, PNG/JPEG export, and basic sharing. The goal is to add export enhancements, editor improvements, more templates, social features, and public API for external integrations.

Current architecture:
- Backend: FastAPI + Pillow for rendering, stores images locally
- Frontend: React + Canvas for live preview, 18 fonts
- Database: PostgreSQL for users/history, Redis for caching/rate limiting

## Goals / Non-Goals

**Goals:**
- Add WebP format and quality options for exports
- Add sticker/emoji library to editor
- Add shape tools and image filters
- Expand template library to 25+ templates
- Add author display on shared images
- Create public API for integrations

**Non-Goals:**
- Video/animation exports
- Advanced photo editing (layers, masks)
- User-to-user messaging
- Mobile apps
- Real-time collaboration

## Decisions

### 1. Export Formats: WebP over SVG
**Decision:** Add WebP support, skip SVG for now
**Rationale:** WebP offers excellent compression (25-35% smaller than PNG), broad browser support, suitable for all use cases. SVG would require significant architecture changes and doesn't fit the gradient-based templates well.

### 2. Quality Implementation
**Decision:** Use Pillow's quality parameter for JPEG/WebP, store multiple quality presets
**Rationale:** Simple to implement, no storage overhead. Quality affects file size but not rendering time.

### 3. Editor Filters: CSS Filters vs Server-Side
**Decision:** Apply filters client-side for preview, render on server with PIL ImageFilter
**Rationale:** Real-time preview is crucial UX. Server-side rendering ensures quality and downloadability.

### 4. Sticker Storage
**Decision:** Use bundled sticker set, not user uploads
**Rationale:** Simpler, no moderation needed, faster. Can expand to user stickers later.

### 5. Public API Auth: API Keys
**Decision:** API key-based authentication with rate limits
**Rationale:** Simple to implement, standard for public APIs. JWT tokens are overkill for server-to-server.

### 6. Remix Storage
**Decision:** Store remix_parent_id in history, not deep copy
**Rationale:** Saves storage, maintains relationship, allows "view original" feature.

## Risks / Trade-offs

### Risk: 4K rendering memory issues
→ **Mitigation:** Add request timeout and memory limit. Use streaming for large outputs.

### Risk: ZIP generation blocks server
→ **Mitigation:** Use background tasks (Celery or simple async) for ZIP generation.

### Risk: Sticker librarybloats bundle size
→ **Mitigation:** Lazy load sticker categories, limit to 50 most popular initially.

### Risk: Public API abuse
→ **Mitigation:** Strict rate limits per API key, monthly quotas, optional paid tiers.

### Risk: Template expansion complexity
→ **Mitigation:** Use template inheritance pattern, share common styles between templates.

### Risk: Filter rendering time
→ **Mitigation:** Cache filtered versions, apply filters during render not post-process.

## Migration Plan

### Phase 1: Export Enhancements (Weeks 1-2)
- Add WebP support to render service
- Add quality parameters
- Create export modal UI

### Phase 2: Editor Tools (Weeks 3-4)
- Add sticker picker
- Add shape tools
- Add filter controls

### Phase 3: Content Expansion (Weeks 5-6)
- Add 16 new templates
- Create category system
- Add category tabs UI

### Phase 4: Social Features (Weeks 7-8)
- Add author display
- Add favorites
- Add remix capability

### Phase 5: Public API (Weeks 9-10)
- API key management
- Documentation
- Webhook system

## Open Questions

- Should we add watermarking for free tier? (deferred)
- How many stickers to include initially? (suggest 50)
- What webhook events are needed? (render.complete, user.signup)
- Need to decide ZIP generation sync vs async
- Should embed work without API key for simple use cases?