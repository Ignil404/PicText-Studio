## ADDED Requirements

### Requirement: External applications can create renders via API
The system SHALL provide a public API that allows external applications to create renders programmatically.

#### Scenario: Create render via API with authentication
- **WHEN** authenticated API user sends POST to /api/v1/render with template_id and text_blocks
- **THEN** the system creates the render and returns image_url

#### Scenario: Create render without authentication
- **WHEN** unauthenticated user sends POST to /api/v1/render
- **THEN** the system returns 401 Unauthorized

#### Scenario: API rate limit exceeded
- **WHEN** API user exceeds their rate limit (e.g., 100 requests/minute)
- **THEN** the system returns 429 Too Many Requests with retry-after header

### Requirement: Users can manage API keys
The system SHALL allow authenticated users to create, view, and revoke API keys for accessing the public API.

#### Scenario: Create new API key
- **WHEN** user goes to API settings and clicks "Создать ключ"
- **THEN** a new API key is generated and displayed (shown once)

#### Scenario: Revoke API key
- **WHEN** user deletes an API key
- **THEN** the key is immediately invalidated and cannot be used

#### Scenario: View API key usage
- **WHEN** user views their API keys
- **THEN** usage statistics (requests this month, last used) are shown for each key

### Requirement: Users can configure webhooks
The system SHALL allow users to configure webhooks that receive notifications when events occur.

#### Scenario: Create webhook
- **WHEN** user adds a webhook URL and selects events (render.complete)
- **THEN** the webhook is registered and will receive POST notifications

#### Scenario: Webhook delivery
- **WHEN** a render completes for a user with active webhooks
- **THEN** a POST request is sent to the configured URL with event data

#### Scenario: Webhook fails
- **WHEN** webhook URL returns non-2xx response or times out
- **THEN** the system retries up to 3 times with exponential backoff

### Requirement: Third-party sites can embed the editor
The system SHALL provide an embeddable iframe that allows third-party sites to include the PicText editor.

#### Scenario: Generate embed code
- **WHEN** user clicks "Поделиться" → "Встроить"
- **THEN** an iframe embed code is generated that can be copied

#### Scenario: Embed renders without auth
- **WHEN** embedded editor creates a render
- **THEN** the render is created with session-only access (no user account needed)