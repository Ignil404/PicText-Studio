## ADDED Requirements

### Requirement: Create Shared Image Link
The system SHALL allow users to create a shareable public link for a rendered image by providing a valid `render_history_id`.

#### Scenario: Successful share creation
- **WHEN** a user sends `POST /api/shared` with a valid `render_history_id` that they own
- **THEN** the system returns `201 Created` with `{"share_id": "<nanoid>", "url": "/shared/<share_id>"}`
- **AND** a new `shared_images` record is created with unique share_id

#### Scenario: Share non-existent render
- **WHEN** a user sends `POST /api/shared` with a `render_history_id` that does not exist
- **THEN** the system returns `404 Not Found` with `{"detail": "Render not found"}`

#### Scenario: Share another user's render
- **WHEN** a user sends `POST /api/shared` with a `render_history_id` they do not own
- **THEN** the system returns `403 Forbidden` with `{"detail": "Not authorized to share this render"}`

### Requirement: View Shared Image
The system SHALL allow anyone to view a shared image by its share ID without authentication.

#### Scenario: View existing shared image
- **WHEN** a client sends `GET /api/shared/:shareId`
- **THEN** the system returns `200 OK` with the render data (template_id, text_blocks, image_url, created_at)

#### Scenario: View non-existent share
- **WHEN** a client sends `GET /api/shared/:shareId` with an invalid share_id
- **THEN** the system returns `404 Not Found` with `{"detail": "Shared image not found"}`

#### Scenario: View share with deleted render
- **WHEN** a client sends `GET /api/shared/:shareId` where the associated render was deleted
- **THEN** the system returns `404 Not Found` with `{"detail": "Shared image not found"}`

### Requirement: Shared Image Data Model
The system SHALL store shared image records with the following attributes:

| Column            | Type     | Constraints                              |
|-------------------|----------|-----------------------------------------|
| id                | UUID     | PK, default uuid4()                     |
| render_history_id | UUID     | NOT NULL, FK → render_history.id        |
| share_id          | String   | NOT NULL, UNIQUE, indexed (10 chars)   |
| created_at        | DateTime | NOT NULL, default now                   |

The `share_id` is generated using nanoid with 10 characters and a URL-safe alphabet.

### Requirement: Share ID Format
The share_id SHALL be URL-safe and human-readable.

#### Scenario: Share ID format validation
- **WHEN** a share is created
- **THEN** the share_id is a 10-character alphanumeric string using characters `A-Za-z0-9_-`
- **AND** the share_id is unique across all shared_images