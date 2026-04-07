## MODIFIED Requirements

### Requirement: Image export
The system SHALL allow users to export the composed canvas as a PNG or JPEG image file. The primary export method SHALL be a server-side render via `POST /api/render` with `session_id` included in the request body. If the backend is unreachable (network error), the system SHALL fall back to client-side `html2canvas` rendering.

#### Scenario: Export as PNG via server render
- **WHEN** user clicks the Export button and selects PNG
- **THEN** the system sends `POST /api/render` with `template_id`, `text_blocks`, `format: "png"`, and `session_id`
- **AND** the downloaded PNG file is the server-rendered image returned from the API

#### Scenario: Export as JPEG via server render
- **WHEN** user clicks the Export button and selects JPEG
- **THEN** the system sends `POST /api/render` with `template_id`, `text_blocks`, `format: "jpeg"`, and `session_id`
- **AND** the downloaded JPEG file is the server-rendered image returned from the API

#### Scenario: Backend unavailable — fallback to html2canvas
- **WHEN** `POST /api/render` fails due to network error or backend unavailability
- **THEN** the system falls back to `html2canvas` rendering
- **AND** the user receives the client-side rendered image

#### Scenario: Render error from backend
- **WHEN** `POST /api/render` returns a non-network error (e.g., 422 validation error)
- **THEN** the system displays the error detail to the user
- **AND** does NOT fall back to html2canvas
