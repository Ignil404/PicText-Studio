# template-gallery Specification

## Purpose
TBD - created by archiving change frontend-scaffold. Update Purpose after archive.
## Requirements
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

### Requirement: Filter templates by category
The system SHALL allow users to filter the displayed templates by category.

#### Scenario: Filter to specific category
- **WHEN** user selects a category filter
- **THEN** only templates matching that category are displayed

#### Scenario: Show all categories
- **WHEN** user selects "All" or clears the filter
- **THEN** all templates are displayed

### Requirement: Select template for editing
The system SHALL allow users to select a template to open it in the editor.

#### Scenario: Select template from grid
- **WHEN** user clicks "Select" or the card for a template
- **THEN** the system navigates to `/editor/{template_id}` with the selected template's ID

### Requirement: Template data contract
The system SHALL represent a template with the following fields: `id` (string), `name` (string), `category` (string), `imageUrl` (string), `width` (number), `height` (number).

#### Scenario: Template object structure
- **WHEN** a template is fetched from the API
- **THEN** it contains all required fields with correct types

