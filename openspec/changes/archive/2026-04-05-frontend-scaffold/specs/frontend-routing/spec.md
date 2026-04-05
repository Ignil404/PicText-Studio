## ADDED Requirements

### Requirement: Gallery route
The system SHALL display the template gallery at the root path `/`.

#### Scenario: Visit root path
- **WHEN** user navigates to `/`
- **THEN** the template gallery page is rendered

### Requirement: Editor route
The system SHALL display the canvas editor at `/editor/:templateId` where `templateId` is a URL parameter.

#### Scenario: Visit editor path with valid template ID
- **WHEN** user navigates to `/editor/t1`
- **THEN** the editor page loads with template `t1` displayed on the canvas

#### Scenario: Visit editor path from gallery selection
- **WHEN** user clicks a template card in the gallery
- **THEN** the browser navigates to `/editor/{id}` with the correct template ID

### Requirement: SPA fallback
The system SHALL use React Router `BrowserRouter` for client-side routing, with all routes resolved without page reloads.

#### Scenario: Navigate between routes
- **WHEN** user moves between `/` and `/editor/:id`
- **THEN** navigation occurs without a full page reload
