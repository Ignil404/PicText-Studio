## ADDED Requirements

### Requirement: Overview statistics
The system SHALL provide aggregated statistics about application usage.

#### Scenario: View daily renders chart
- **WHEN** admin opens `/admin/stats`
- **THEN** the system displays a line chart showing render count per day
- **AND** default period is last 7 days
- **AND** admin can select custom date range (up to 30 days)

#### Scenario: View popular templates
- **WHEN** admin views the stats page
- **THEN** the system shows a bar chart of top 10 most rendered templates
- **AND** includes render count for each template

#### Scenario: View user activity
- **WHEN** admin views the stats page
- **THEN** the system shows metrics:
  - New users per day (line chart)
  - Active users per day (users who made at least one render)

### Requirement: Statistics API caching
The system SHALL cache expensive statistics queries for performance.

#### Scenario: Cached stats response
- **WHEN** admin requests statistics for a date range
- **AND** that exact query was made within last 5 minutes
- **THEN** the system returns cached results from Redis
- **AND** subsequent requests within TTL use cache

#### Scenario: Cache invalidation
- **WHEN** new render is created
- **THEN** relevant stats caches are invalidated or updated
