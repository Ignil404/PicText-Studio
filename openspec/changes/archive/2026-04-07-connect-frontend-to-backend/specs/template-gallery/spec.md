## MODIFIED Requirements

### Requirement: Browse template gallery
The system SHALL display available meme templates as a grid of cards, each showing a thumbnail preview, name, and category. Templates SHALL be fetched from `GET /api/templates` on page load. The system SHALL NOT use mock or hardcoded template data.

#### Scenario: Display templates on page load
- **WHEN** user navigates to the gallery page
- **THEN** the system sends a GET request to `/api/templates`
- **AND** renders the returned templates as a grid of cards with thumbnail, name, and category

#### Scenario: Loading and error states
- **WHEN** templates are being fetched from `/api/templates`
- **THEN** a loading indicator is shown
- **AND** if the fetch fails, an error message with a retry option is displayed
