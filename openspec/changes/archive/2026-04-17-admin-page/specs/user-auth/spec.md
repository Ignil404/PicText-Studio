## MODIFIED Requirements

### Requirement: User role field
The system SHALL store a role field for each user, distinguishing between regular users and administrators.

#### Scenario: User registration with default role
- **WHEN** a new user registers via `POST /api/auth/register`
- **THEN** the user is created with `role: "user"` (default)

#### Scenario: JWT includes role claim
- **WHEN** the system creates an access token
- **THEN** the JWT payload includes `role: "user"` or `role: "admin"`

#### Scenario: Role in user info response
- **WHEN** client requests `GET /api/auth/me`
- **THEN** the response includes the user's role field

### Requirement: Blocked user flag
The system SHALL support blocking user accounts.

#### Scenario: Blocked status in database
- **WHEN** a user is blocked by admin
- **THEN** the `is_blocked` column is set to `true`
- **AND** the user's refresh tokens are invalidated

#### Scenario: Blocked check on authentication
- **WHEN** a blocked user tries to use a valid access token
- **THEN** the `get_current_user()` dependency checks `is_blocked`
- **AND** returns `403 Forbidden` if blocked
