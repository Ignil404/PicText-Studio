## ADDED Requirements

### Requirement: History page route
The system SHALL provide a `/history` route that displays the render history for the current session.

#### Scenario: Navigate to history page
- **WHEN** the user navigates to `/history`
- **THEN** the system renders the `HistoryPage` component with the current session's render history

#### Scenario: No session history
- **WHEN** the current session has no previous renders
- **THEN** the system displays a "No renders yet" message with a link back to the gallery

### Requirement: History data fetching
The system SHALL fetch history entries from `GET /api/history/{session_id}` when the history page loads.

#### Scenario: Successful history fetch
- **WHEN** the history page loads and the API returns entries
- **THEN** each entry displays a thumbnail image, template name, and timestamp

#### Scenario: History fetch failure
- **WHEN** the history page loads but the API request fails
- **THEN** the system displays an error message with a retry button

### Requirement: History entry display
The system SHALL render each history entry as a card containing a thumbnail (from `image_url`), template name, creation timestamp, and an action to re-open the template in the editor.

#### Scenario: View history entry
- **WHEN** a history entry is displayed
- **THEN** the card shows the rendered image thumbnail, the template name, and a "Created at" timestamp in a human-readable format

#### Scenario: Re-edit from history
- **WHEN** the user clicks on a history entry
- **THEN** the system navigates to `/editor/{template_id}` with the template ID from that entry

### Requirement: History loading state
The system SHALL display a loading indicator while history entries are being fetched.

#### Scenario: Loading history
- **WHEN** the history request is in-flight
- **THEN** the system displays a loading spinner or skeleton
