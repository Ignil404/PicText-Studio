## ADDED Requirements

### Requirement: Canvas editor layout
The system SHALL display a canvas area showing the selected template image as the background with text overlay elements rendered on top.

#### Scenario: Load template into canvas
- **WHEN** user navigates to an editor page with a valid template ID
- **THEN** system displays the template image as the canvas background with a text overlay layer

#### Scenario: Invalid template ID
- **WHEN** user navigates to an editor with a non-existent template ID
- **THEN** system displays an error message with a link to return to the gallery

### Requirement: Text element management
The system SHALL allow users to add, modify, and remove text elements on the canvas.

#### Scenario: Add new text element
- **WHEN** user clicks "Add Text" in the toolbar
- **THEN** a new text element with default styling is added at the center of the canvas

#### Scenario: Update text content
- **WHEN** user edits text in a selected element
- **THEN** the element's displayed text updates in real time

#### Scenario: Remove text element
- **WHEN** user removes a text element
- **THEN** the element is removed from the canvas

### Requirement: Draggable text positioning
The system SHALL allow users to drag text elements freely across the canvas. Positions SHALL be stored as percentages relative to canvas dimensions to ensure consistent scaling.

#### Scenario: Drag text element
- **WHEN** user clicks and drags a text element to a new position
- **THEN** the element follows the cursor and its position is stored as CSS percentages

#### Scenario: Resize canvas
- **WHEN** the canvas container is resized
- **THEN** text elements maintain their relative positions due to percentage-based coordinates

### Requirement: Text formatting toolbar
The system SHALL provide a toolbar for styling the currently selected text element with: font family selection, font size input, color picker, and bold/italic toggles.

#### Scenario: Change font family
- **WHEN** user selects a different font family from the toolbar
- **THEN** the selected text element's font family updates immediately

#### Scenario: Change font size
- **WHEN** user modifies the font size in the toolbar
- **THEN** the selected text element's size updates immediately

#### Scenario: Change text color
- **WHEN** user selects a different color in the color picker
- **THEN** the selected text element's text color updates immediately

#### Scenario: Toggle bold or italic
- **WHEN** user toggles the bold or italic button in the toolbar
- **THEN** the selected text element's font-weight or font-style updates immediately

### Requirement: Image export
The system SHALL allow users to export the composed canvas as a PNG or JPEG image file using html2canvas.

#### Scenario: Export as PNG
- **WHEN** user clicks the Export button and selects PNG
- **THEN** a PNG file of the rendered canvas is downloaded to the user's device

#### Scenario: Export as JPEG
- **WHEN** user clicks the Export button and selects JPEG
- **THEN** a JPEG file of the rendered canvas is downloaded to the user's device

### Requirement: Abort controller for render calls
The system SHALL cancel in-flight backend render requests when new render calls are initiated to avoid race conditions.

#### Scenario: Rapid render calls
- **WHEN** user makes multiple rapid changes that trigger render calls
- **THEN** the previous in-flight request is cancelled before the new one is sent

### Requirement: Text element data contract
The system SHALL represent a text element with the following fields: `id` (string), `text` (string), `x` (number, percentage), `y` (number, percentage), `fontSize` (number), `fontFamily` (string), `color` (string), `bold` (boolean), `italic` (boolean).

#### Scenario: Text element creation
- **WHEN** a new text element is created
- **THEN** it is initialized with default values: empty text, center position, 24px font size, Arial, white color, no bold, no italic
