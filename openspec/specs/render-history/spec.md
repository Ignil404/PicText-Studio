## MODIFIED Requirements

### Requirement: History Retrieval
The system SHALL return the render history for the authenticated user or the current guest session.

#### Scenario: Authenticated user history
- **WHEN** a client sends `GET /api/history/me` with a valid JWT access token
- **THEN** the system returns `200 OK` with a JSON array of render records owned by that user
- **AND** each record contains `id`, `template_id`, `template_name`, `text_blocks`, `image_url`, `created_at`
- **AND** records are ordered by `created_at` descending

#### Scenario: Guest user history
- **WHEN** a client sends `GET /api/history/me` without a JWT but with a `session_id` cookie or query parameter
- **THEN** the system returns `200 OK` with render records where `session_id` matches AND `owner_id IS NULL`
- **AND** records are ordered by `created_at` descending

#### Scenario: Empty history
- **WHEN** the user or session has no renders
- **THEN** the system returns `200 OK` with an empty JSON array `[]`

### Requirement: History Data Model
The system SHALL store render history with the following attributes:

| Column       | Type     | Constraints                     |
|--------------|----------|---------------------------------|
| id           | UUID     | PK, default uuid4()             |
| session_id   | String   | NULLABLE, indexed               |
| owner_id     | UUID     | NULLABLE, FK → users.id         |
| template_id  | UUID     | NOT NULL, FK → templates.id     |
| text_blocks  | JSONB    | NOT NULL                        |
| image_path   | Text     | NOT NULL                        |
| created_at   | DateTime | NOT NULL, default now           |

When `owner_id` is set, the render belongs to an authenticated user. When `owner_id` is NULL, the render belongs to a guest identified by `session_id`.

Text blocks JSONB structure matches the POST /api/render request text_blocks format.

### Requirement: Session History Creation
The system SHALL automatically create a history record for each successful render.

#### Scenario: Guest render creates history
- **WHEN** `POST /api/render` completes successfully for a guest (no JWT)
- **THEN** a new history record is inserted with `session_id` from the request body
- **AND** `owner_id` is set to NULL
- **AND** the record is returned in subsequent `GET /api/history/me` responses

#### Scenario: Authenticated render creates history
- **WHEN** `POST /api/render` completes successfully for an authenticated user (valid JWT)
- **THEN** a new history record is inserted with `owner_id` from the JWT `sub` claim
- **AND** `session_id` is recorded if provided, otherwise NULL
- **AND** the record is returned in subsequent `GET /api/history/me` responses
