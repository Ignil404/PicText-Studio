## 1. Backend Setup

- [x] 1.1 Create uploads directory structure (`/uploads/profile-images/`)
- [x] 1.2 Add file upload dependencies (python-multipart)
- [x] 1.3 Configure static file serving for uploads directory

## 2. Backend API Implementation

- [x] 2.1 Create image upload endpoint `POST /api/users/me/image`
- [x] 2.2 Implement file validation (MIME type, extension, size)
- [x] 2.3 Create image retrieval endpoint `GET /api/users/me/image`
- [x] 2.4 Create image deletion endpoint `DELETE /api/users/me/image`
- [x] 2.5 Add authentication dependency to all endpoints

## 3. Frontend Implementation

- [x] 3.1 Install react-dropzone library
- [x] 3.2 Create ImageUpload component with drag-and-drop
- [x] 3.3 Create ImagePreview component
- [x] 3.4 Create ImageDelete button component
- [x] 3.5 Integrate upload components into profile page

## 4. Integration & Testing

- [x] 4.1 Connect frontend to backend API
- [x] 4.2 Add loading states and error handling
- [x] 4.3 Test upload flow (success, invalid type, too large)
- [x] 4.4 Test retrieval flow (with image, without image)
- [x] 4.5 Test deletion flow

## 5. Code Quality

- [x] 5.1 Run ruff linting
- [x] 5.2 Run mypy type checking
- [x] 5.3 Add unit tests for backend endpoints
- [x] 5.4 Verify pre-commit hooks pass