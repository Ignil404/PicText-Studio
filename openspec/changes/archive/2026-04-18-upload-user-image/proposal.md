## Why

Users need the ability to upload and display profile images. Currently, profile pages are stubs with only session-based UUID authentication. Adding image upload capability enables personalization and improves user experience.

## What Changes

- Add backend endpoint for image upload with validation (file type, size)
- Add image storage (local filesystem or cloud storage)
- Add frontend image upload component with drag-and-drop
- Add image preview in profile page
- Add image deletion capability

## Capabilities

### New Capabilities
- `user-profile-image`: Handle image upload, storage, retrieval, and deletion for user profiles

### Modified Capabilities
- None

## Impact

- Backend: New API endpoint `/api/users/me/image`
- Frontend: Upload component in profile settings
- Storage: Local uploads directory or cloud storage integration
- Dependencies: File validation library, image processing