## ADDED Requirements

### Requirement: Admin role in JWT
The system SHALL include the user's role in the JWT access token and verify admin privileges on protected endpoints.

#### Scenario: Valid admin token
- **WHEN** a request includes a valid JWT with `role: "admin"` in the payload
- **AND** the endpoint uses `Depends(require_admin())`
- **THEN** the request is processed normally

#### Scenario: Non-admin user attempts admin action
- **WHEN** a request includes a valid JWT with `role: "user"`
- **AND** the endpoint requires admin role
- **THEN** the system returns `403 Forbidden` with `{ "detail": "Admin access required" }`

#### Scenario: Missing or invalid token
- **WHEN** a request to admin endpoint has no JWT or invalid JWT
- **THEN** the system returns `401 Unauthorized`

### Requirement: Admin role middleware
The system SHALL provide a reusable dependency to check admin privileges across all admin endpoints.

#### Scenario: Dependency injection
- **WHEN** a router includes `dependencies=[Depends(require_admin)]`
- **THEN** all endpoints in that router require admin role
- **AND** non-admin requests receive `403 Forbidden`

### Requirement: Frontend admin guard
The system SHALL protect admin frontend routes from non-admin users.

#### Scenario: Admin user navigates to /admin
- **WHEN** an admin user accesses `/admin/*` routes
- **AND** the JWT contains `role: "admin"`
- **THEN** the route renders the admin page

#### Scenario: Regular user navigates to /admin
- **WHEN** a non-admin user attempts to access `/admin/*`
- **THEN** the system redirects to `/` or shows `403` page
