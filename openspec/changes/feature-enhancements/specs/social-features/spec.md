## ADDED Requirements

### Requirement: Shared images display author information
The system SHALL show the author's avatar and name on publicly shared images.

#### Scenario: View shared image with author
- **WHEN** user opens a shared image link
- **THEN** the author's avatar and name are displayed near the image

#### Scenario: Shared image has no author
- **WHEN** user opens a shared image that was created without an account
- **THEN** "Аноним" is displayed as the author

### Requirement: User can favorite a render
The system SHALL allow authenticated users to save renders to their favorites for quick access.

#### Scenario: Add render to favorites
- **WHEN** user clicks the heart/star icon on a render
- **THEN** the render is added to their favorites list

#### Scenario: Remove render from favorites
- **WHEN** user clicks the filled heart/star icon on a favorited render
- **THEN** the render is removed from their favorites

#### Scenario: View favorites list
- **WHEN** user navigates to their profile and clicks "Избранное"
- **THEN** a list of all favorited renders is displayed

### Requirement: User can remix a shared image
The system SHALL allow users to create a copy of a shared image as a starting point for their own variation.

#### Scenario: Remix shared image
- **WHEN** user clicks "Ремикс" or "Создать свою версию" on a shared image
- **THEN** the editor opens with the template and text pre-filled from the original

#### Scenario: View remix parent
- **WHEN** user views a remixed image
- **THEN** a "Ремикс ... original" link is shown that goes to the original