## ADDED Requirements

### Requirement: Session History Retrieval
The system SHALL return the render history for a given session ID.

#### Scenario: Non-empty session
- **WHEN** client sends `GET /api/history/{session_id}`
- **THEN** the system returns `200 OK` with a JSON array of render records
- **AND** each record contains `id`, `template_id`, `template_name`, `text_blocks`, `image_url`, `created_at`
- **AND** records are ordered by `created_at` descending

#### Scenario: Empty session
- **WHEN** client sends `GET /api/history/{session_id}` with a session that has no renders
- **THEN** the system returns `200 OK` with an empty JSON array `[]`

### Requirement: History Data Model
The system SHALL store render history with the following attributes:

| Column       | Type     | Constraints                     |
|--------------|----------|---------------------------------|
| id           | UUID     | PK, default uuid4()             |
| session_id   | String   | NOT NULL, indexed               |
| template_id  | UUID     | NOT NULL, FK -> templates.id    |
| text_blocks  | JSONB    | NOT NULL                        |
| image_path   | String   | NOT NULL                        |
| created_at   | DateTime | NOT NULL, default now           |

Text blocks JSONB structure matches the POST /api/render request text_blocks format.

### Requirement: Session History Creation
The system SHALL automatically create a history record for each successful render.

#### Scenario: Render creates history
- **WHEN** `POST /api/render` completes successfully
- **THEN** a new history record is inserted with `session_id`, `template_id`, `text_blocks`, and `image_path`
- **AND** the record is returned in subsequent `GET /api/history/{session_id}` responses
