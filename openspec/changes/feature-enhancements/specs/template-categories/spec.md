## ADDED Requirements

### Requirement: Templates are organized into categories
The system SHALL organize templates into categories (Новый год, День рождения, Бизнес, Спорт, Цитаты, Праздники) for easier discovery.

#### Scenario: Browse templates by category
- **WHEN** user clicks on a category tab on the home page
- **THEN** only templates from that category are displayed

#### Scenario: View all templates
- **WHEN** user clicks "Все" or "All" category tab
- **THEN** all templates across all categories are displayed

#### Scenario: Category has empty state
- **WHEN** user navigates to a category with no templates
- **THEN** a message "В этой категории пока нет шаблонов" is displayed

### Requirement: User can see template preview on hover
The system SHALL show a larger preview of a template when the user hovers over it.

#### Scenario: Hover shows preview
- **WHEN** user hovers over a template card
- **THEN** a larger preview of the template appears

### Requirement: Templates have accurate emoji indicators
Each template SHALL have an emoji that represents its visual style for quick identification.

#### Scenario: Emoji matches template style
- **WHEN** user sees template with 🎉 emoji
- **THEN** the template contains celebratory visual elements