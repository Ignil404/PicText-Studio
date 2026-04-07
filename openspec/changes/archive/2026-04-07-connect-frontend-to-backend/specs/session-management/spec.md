## ADDED Requirements

### Requirement: Client session ID generation
The system SHALL generate a unique session identifier using `crypto.randomUUID()` on the client's first visit to the application.

#### Scenario: First visit — no existing session
- **WHEN** the application loads and no `session_id` exists in `localStorage`
- **THEN** the system generates a new UUID via `crypto.randomUUID()` and stores it in `localStorage` under the key `session_id`

#### Scenario: Returning visit — existing session
- **WHEN** the application loads and a `session_id` already exists in `localStorage`
- **THEN** the system reuses the existing `session_id` without generating a new one

### Requirement: Session ID inclusion in API requests
The system SHALL include the `session_id` in the request body of `POST /api/render` calls.

#### Scenario: Render request includes session_id
- **WHEN** the client sends a render request to `POST /api/render`
- **THEN** the request body includes the `session_id` field with the value from `localStorage`

### Requirement: Session ID access
The system SHALL provide a utility function to retrieve the current session ID from `localStorage`.

#### Scenario: Retrieve session ID
- **WHEN** any module calls `getSessionId()`
- **THEN** the function returns the `session_id` string from `localStorage`
