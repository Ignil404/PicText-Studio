## Context

The application currently has profile pages that are stubs with session-based UUID authentication. Users cannot upload or display profile images. The system needs to support image upload for profile personalization.

## Goals / Non-Goals

**Goals:**
- Enable users to upload profile images (JPEG, PNG, GIF, WebP)
- Validate file types and sizes (max 5MB)
- Store images persistently
- Display uploaded images in profile
- Allow users to delete their profile image

**Non-Goals:**
- Image cropping/editing (out of scope)
- Cloud storage integration (local filesystem only for v1)
- Automatic image resizing (original size stored)
- Profile image for other users (only own profile)

## Decisions

1. **Storage: Local filesystem**
   - Store images in `/uploads/profile-images/` directory
   - Use user ID as filename (with original extension)
   - Rationale: Simple to implement, no external dependencies, sufficient for v1

2. **File validation: Server-side**
   - Validate MIME type and file extension
   - Check file size (max 5MB)
   - Rationale: Security - cannot trust client-side validation alone

3. **Image serving: Static files**
   - Serve images via FastAPI static files endpoint
   - Rationale: Simple, efficient, no need for signed URLs

4. **Frontend: Drag-and-drop upload**
   - Use React dropzone library
   - Show image preview before upload
   - Rationale: Better UX, handles drag-drop and click upload

## Risks / Trade-offs

- [Risk: Large file uploads could cause memory issues] → Mitigation: Stream upload, validate size before reading entire file
- [Risk: Filename collisions] → Mitigation: Use UUID + user ID combination
- [Risk: No image resizing could cause slow loads] → Future enhancement, not in v1
- [Risk: Local storage not suitable for multi-instance deployment] → Consider cloud storage in v2

## Migration Plan

1. Create uploads directory in container
2. Add image upload endpoint
3. Add image retrieval endpoint
4. Add image deletion endpoint
5. Create frontend upload component
6. Update profile page to show image
7. Test end-to-end flow

## Open Questions

- Should we generate thumbnails? (deferred to v2)
- Should we limit upload rate per user? (use existing rate limiting)
- Storage cleanup when user deletes account? (handle in user deletion flow)