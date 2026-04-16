## ADDED Requirements

### Requirement: User registration
The system SHALL allow users to register with an email address and password. The email MUST be unique. The password MUST be at least 8 characters long.

#### Scenario: Successful registration
- **WHEN** a client sends `POST /api/auth/register` with a valid `email` and `password` (≥8 chars) that is not already registered
- **THEN** the system creates a `User` record with a bcrypt-hashed password
- **AND** returns `201 Created` with `{ "id": "<uuid>", "email": "<email>", "created_at": "<iso-timestamp>" }`
- **AND** sets an httpOnly refresh token cookie

#### Scenario: Duplicate email
- **WHEN** a client sends `POST /api/auth/register` with an email that is already registered
- **THEN** the system returns `409 Conflict` with `{ "detail": "Email already registered" }`

#### Scenario: Short password
- **WHEN** a client sends `POST /api/auth/register` with a password shorter than 8 characters
- **THEN** the system returns `422 Unprocessable Entity` with field-level validation errors

### Requirement: User login
The system SHALL authenticate users with email and password and issue JWT tokens.

#### Scenario: Successful login
- **WHEN** a client sends `POST /api/auth/login` with valid `email` and `password`
- **AND** the credentials match a registered user
- **THEN** the system returns `200 OK` with `{ "access_token": "<jwt>", "token_type": "bearer" }`
- **AND** sets an httpOnly refresh token cookie with a 7-day expiration

#### Scenario: Invalid credentials
- **WHEN** a client sends `POST /api/auth/login` with an incorrect email or password
- **THEN** the system returns `401 Unauthorized` with `{ "detail": "Incorrect email or password" }`
- **AND** does NOT reveal whether the email or password was specifically wrong

#### Scenario: Missing fields
- **WHEN** a client sends `POST /api/auth/login` with missing email or password
- **THEN** the system returns `422 Unprocessable Entity` with field-level validation errors

### Requirement: Token refresh
The system SHALL allow clients to refresh an expired access token using a valid refresh token.

#### Scenario: Successful token refresh
- **WHEN** a client sends `POST /api/auth/refresh` with a valid httpOnly refresh token cookie
- **AND** the token is not expired
- **THEN** the system returns `200 OK` with a new `{ "access_token": "<jwt>", "token_type": "bearer" }`
- **AND** sets a new httpOnly refresh token cookie

#### Scenario: Expired refresh token
- **WHEN** a client sends `POST /api/auth/refresh` with an expired refresh token
- **THEN** the system returns `401 Unauthorized` with `{ "detail": "Refresh token expired" }`

#### Scenario: No refresh token
- **WHEN** a client sends `POST /api/auth/refresh` without a refresh token cookie
- **THEN** the system returns `401 Unauthorized` with `{ "detail": "No refresh token provided" }`

### Requirement: User logout
The system SHALL invalidate the user's refresh token on logout.

#### Scenario: Successful logout
- **WHEN** a client sends `POST /api/auth/logout` with a valid refresh token
- **THEN** the system returns `204 No Content`
- **AND** clears the refresh token cookie

### Requirement: JWT authentication dependency
The system SHALL provide a FastAPI dependency `get_current_user()` that extracts and validates the JWT access token from the `Authorization: Bearer` header.

#### Scenario: Valid JWT token
- **WHEN** an endpoint uses `Depends(get_current_user())`
- **AND** the request includes a valid `Authorization: Bearer <jwt>` header
- **THEN** the dependency returns the corresponding `User` object

#### Scenario: Missing authorization header
- **WHEN** an endpoint uses `Depends(get_current_user())`
- **AND** the request does NOT include an `Authorization` header
- **THEN** the system returns `401 Unauthorized` with `{ "detail": "Not authenticated" }`

#### Scenario: Expired JWT token
- **WHEN** an endpoint uses `Depends(get_current_user())`
- **AND** the request includes an expired JWT
- **THEN** the system returns `401 Unauthorized` with `{ "detail": "Token expired" }`

### Requirement: Guest session migration
The system SHALL allow a newly authenticated user to claim their guest render history.

#### Scenario: Migrate guest renders on login
- **WHEN** a logged-in user sends `POST /api/auth/migrate-session` with a `session_id`
- **THEN** the system updates all `render_history` rows where `session_id` matches AND `owner_id IS NULL`
- **AND** sets `owner_id` to the authenticated user's ID
- **AND** returns `200 OK` with `{ "migrated_count": <int> }`

#### Scenario: No guest renders to migrate
- **WHEN** a logged-in user sends `POST /api/auth/migrate-session` with a `session_id` that has no matching guest renders
- **THEN** the system returns `200 OK` with `{ "migrated_count": 0 }`
