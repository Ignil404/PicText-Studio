## ADDED Requirements

### Requirement: Template List
The system SHALL return a paginated list of all templates with their metadata.

#### Scenario: Requesting all templates
- **WHEN** client sends `GET /api/templates`
- **THEN** the system returns `200 OK` with a JSON array of template objects
- **AND** each object contains `id`, `name`, `category`, `imageUrl`, `width`, `height`, and `textZones`
- **AND** results are ordered by `created_at` ascending

#### Scenario: Redis cache hit
- **WHEN** a client requests `GET /api/templates` and the response is cached
- **THEN** the system returns the cached response within 50ms
- **AND** does not query the database

#### Scenario: Redis cache miss
- **WHEN** a client requests `GET /api/templates` and the key is not cached
- **THEN** the system queries the database
- **AND** stores the result in Redis with TTL 600 seconds
- **AND** returns the response

### Requirement: Single Template Fetch
The system SHALL return a single template by its ID.

#### Scenario: Existing template
- **WHEN** client sends `GET /api/templates/{id}` with a valid UUID
- **THEN** the system returns `200 OK` with the template object

#### Scenario: Template not found
- **WHEN** client sends `GET /api/templates/{id}` with a non-existent UUID
- **THEN** the system returns `404 Not Found` with `{"detail": "Template not found"}`

### Requirement: Category Listing
The system SHALL return distinct template categories.

#### Scenario: Requesting categories
- **WHEN** client sends `GET /api/templates/categories`
- **THEN** the system returns `200 OK` with a JSON array of unique category strings
- **AND** the array includes at least "All"

### Requirement: Template Data Model
The system SHALL store templates with the following attributes:

| Column     | Type     | Constraints          |
|------------|----------|----------------------|
| id         | UUID     | PK, default uuid4()  |
| name       | String   | NOT NULL             |
| category   | String   | NOT NULL             |
| image_path | String   | NOT NULL             |
| width      | Integer  | NOT NULL             |
| height     | Integer  | NOT NULL             |
| text_zones | JSONB    | NOT NULL, default {} |
| created_at | DateTime | NOT NULL, default now|

Text zones JSONB structure: `[{ id: string, x: number, y: number, font_family: string, font_size: integer, color: string, width: integer, height: integer }]`
