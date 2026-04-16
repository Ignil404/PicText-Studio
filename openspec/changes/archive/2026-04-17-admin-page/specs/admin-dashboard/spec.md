## ADDED Requirements

### Requirement: Admin dashboard overview
The system SHALL provide a dashboard page at `/admin` showing key metrics and quick navigation to admin functions.

#### Scenario: Admin accesses dashboard
- **WHEN** an admin navigates to `/admin`
- **THEN** the system displays a dashboard with:
  - Total renders (last 7 days)
  - Total users count
  - Total templates count
  - Quick links to Templates, Users, Stats sections

#### Scenario: Dashboard data loading
- **WHEN** the dashboard loads
- **THEN** it fetches aggregated data from `/api/admin/dashboard`
- **AND** shows loading skeletons while data is fetching
- **AND** handles errors gracefully with retry option
