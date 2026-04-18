## ADDED Requirements

### Requirement: User can upload profile image
The system SHALL allow authenticated users to upload a profile image file. The uploaded file MUST be a valid image (JPEG, PNG, GIF, or WebP) and MUST NOT exceed 5MB in size.

#### Scenario: Successful image upload
- **WHEN** user uploads a valid image file (JPEG, PNG, GIF, or WebP) under 5MB
- **THEN** the system stores the image and returns success response with image URL

#### Scenario: Upload exceeds file size limit
- **WHEN** user uploads a file larger than 5MB
- **THEN** the system rejects the upload and returns 400 error with message "File too large. Maximum size is 5MB."

#### Scenario: Upload invalid file type
- **WHEN** user uploads a file that is not a valid image (e.g., PDF, TXT)
- **THEN** the system rejects the upload and returns 400 error with message "Invalid file type. Allowed: JPEG, PNG, GIF, WebP"

### Requirement: User can view their profile image
The system SHALL provide an endpoint to retrieve the user's profile image.

#### Scenario: Profile image exists
- **WHEN** user requests their profile image
- **THEN** the system returns the image file with appropriate content type

#### Scenario: No profile image uploaded
- **WHEN** user requests their profile image but none exists
- **THEN** the system returns a default profile placeholder image

### Requirement: User can delete their profile image
The system SHALL allow users to delete their profile image.

#### Scenario: Delete existing profile image
- **WHEN** user requests to delete their profile image
- **THEN** the system removes the image file and returns success response

#### Scenario: Delete when no image exists
- **WHEN** user requests to delete their profile image but none exists
- **THEN** the system returns success response (idempotent operation)

### Requirement: Unauthenticated users cannot modify profile image
The system SHALL reject any image upload, update, or delete requests from unauthenticated users.

#### Scenario: Upload without authentication
- **WHEN** unauthenticated user attempts to upload an image
- **THEN** the system returns 401 Unauthorized

#### Scenario: Delete without authentication
- **WHEN** unauthenticated user attempts to delete an image
- **THEN** the system returns 401 Unauthorized