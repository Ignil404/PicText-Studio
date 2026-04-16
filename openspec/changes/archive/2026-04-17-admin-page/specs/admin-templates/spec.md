## ADDED Requirements

### Requirement: List templates
The system SHALL provide a paginated list of all templates with search and filter capabilities.

#### Scenario: View template list
- **WHEN** admin opens `/admin/templates`
- **THEN** the system displays a table with columns: ID, Name, Preview, Created At, Status (active/inactive)
- **AND** supports pagination (10/25/50 per page)

#### Scenario: Search templates
- **WHEN** admin types in the search box
- **THEN** the system filters templates by name (case-insensitive, partial match)
- **AND** updates the list in real-time (with debounce)

#### Scenario: Filter by status
- **WHEN** admin selects a status filter (All / Active / Inactive)
- **THEN** the list shows only templates matching that status

### Requirement: Create template
The system SHALL allow admins to create new templates via a form.

#### Scenario: Create new template
- **WHEN** admin clicks "Create Template" and fills the form
- **AND** submits with valid data (name, gradient colors, font settings)
- **THEN** the system creates the template and redirects to the template list
- **AND** shows a success toast notification

#### Scenario: Validation error on create
- **WHEN** admin submits the form with invalid data (e.g., empty name)
- **THEN** the system shows field-level validation errors
- **AND** prevents submission until errors are fixed

### Requirement: Edit template
The system SHALL allow admins to edit existing templates.

#### Scenario: Edit template
- **WHEN** admin clicks "Edit" on a template row
- **THEN** the system opens an edit form pre-filled with current values
- **AND** allows modifying all template fields
- **AND** saves changes on submit

### Requirement: Delete/Deactivate template
The system SHALL allow admins to deactivate or delete templates.

#### Scenario: Deactivate template
- **WHEN** admin clicks "Deactivate" on an active template
- **AND** confirms the action in a modal dialog
- **THEN** the template is marked as inactive (hidden from gallery)
- **AND** existing renders remain accessible

#### Scenario: Activate template
- **WHEN** admin clicks "Activate" on an inactive template
- **THEN** the template becomes visible in the gallery again

### Requirement: Template preview
The system SHALL show a live preview of the template during creation/editing.

#### Scenario: Preview while editing
- **WHEN** admin changes template settings (colors, fonts)
- **THEN** the preview updates in real-time showing a sample render
- **AND** uses default text if no custom text provided
