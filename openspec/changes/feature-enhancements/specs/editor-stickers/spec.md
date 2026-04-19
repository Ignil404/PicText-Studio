## ADDED Requirements

### Requirement: User can add stickers to their image
The system SHALL provide a library of stickers/emojis that users can drag onto their image during editing.

#### Scenario: Add sticker from library
- **WHEN** user opens sticker panel, selects a sticker, and drops it on the image
- **THEN** the sticker appears at the drop location and can be moved/resized/deleted

#### Scenario: Remove sticker
- **WHEN** user selects a placed sticker and clicks delete
- **THEN** the sticker is removed from the image

#### Scenario: Resize sticker
- **WHEN** user drags corner handles of a selected sticker
- **THEN** the sticker resizes proportionally

### Requirement: User can add shapes to their image
The system SHALL allow users to add basic geometric shapes (circles, rectangles, lines, arrows) to their image.

#### Scenario: Add circle shape
- **WHEN** user selects circle tool and draws on the image
- **THEN** a circle appears that can be moved, resized, and deleted

#### Scenario: Add arrow shape
- **WHEN** user selects arrow tool and drags from point A to point B
- **THEN** an arrow is drawn connecting the two points

#### Scenario: Change shape color
- **WHEN** user selects a shape and chooses a color
- **THEN** the shape's fill or stroke changes to the selected color

### Requirement: User can apply filters to their image
The system SHALL provide image filters (brightness, contrast, blur, grayscale, sepia) that can be applied to the rendered image.

#### Scenario: Apply brightness filter
- **WHEN** user adjusts brightness slider to +20%
- **THEN** the image appears brighter proportionally

#### Scenario: Apply sepia filter
- **WHEN** user selects sepia filter
- **THEN** the image is converted to sepia tones

#### Scenario: Reset filters
- **WHEN** user clicks "Reset Filters" button
- **THEN** all filters are removed and image returns to original state