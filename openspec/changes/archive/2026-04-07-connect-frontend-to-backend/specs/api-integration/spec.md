## ADDED Requirements

### Requirement: Real template fetching
The system SHALL fetch templates from `GET /api/templates` instead of returning mock data.

#### Scenario: Successful template fetch
- **WHEN** `fetchTemplates()` is called
- **THEN** the system sends a GET request to `/api/templates` and returns the parsed JSON response as `Template[]`

#### Scenario: Template fetch failure
- **WHEN** the GET request to `/api/templates` fails (network error, non-2xx response)
- **THEN** the function throws an Error with a descriptive message

### Requirement: Single template fetching
The system SHALL fetch a single template from `GET /api/templates/{id}`.

#### Scenario: Successful single template fetch
- **WHEN** `fetchTemplateById(id)` is called with a valid ID
- **THEN** the system sends a GET request to `/api/templates/{id}` and returns the parsed response

#### Scenario: Template not found
- **WHEN** `fetchTemplateById(id)` is called with a non-existent ID
- **THEN** the function throws an Error or returns `undefined`

### Requirement: History fetching
The system SHALL provide a `fetchHistory(sessionId)` function that calls `GET /api/history/{session_id}`.

#### Scenario: Successful history fetch
- **WHEN** `fetchHistory(sessionId)` is called
- **THEN** the system sends a GET request to `/api/history/{sessionId}` and returns the parsed JSON response

### Requirement: Render request includes session_id
The system SHALL include `session_id` in the body of `POST /api/render` requests, sourced from `localStorage`.

#### Scenario: Render with session_id
- **WHEN** `renderImage(request)` is called
- **THEN** the request body includes `session_id` from `localStorage`

### Requirement: API error response handling
The system SHALL parse error responses from the backend and surface the `detail` field.

#### Scenario: Backend returns validation error
- **WHEN** the backend responds with `422 Unprocessable Entity`
- **THEN** the client extracts the `detail` field and includes it in the thrown Error
