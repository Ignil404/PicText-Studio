## ADDED Requirements

### Requirement: View user profile
The system SHALL display the authenticated user's profile information.

#### Scenario: Authenticated user views profile
- **WHEN** a logged-in user navigates to `/profile`
- **THEN** the system displays the user's email address, account creation date, and total render count
- **AND** the data is fetched from `GET /api/auth/me`

#### Scenario: Guest user views profile
- **WHEN** a guest (no JWT) navigates to `/profile`
- **THEN** the system displays the guest session ID and a prompt to log in for persistent history

### Requirement: User info endpoint
The system SHALL provide an endpoint to retrieve the current user's information.

#### Scenario: Get current user info
- **WHEN** a client sends `GET /api/auth/me` with a valid JWT access token
- **THEN** the system returns `200 OK` with `{ "id": "<uuid>", "email": "<email>", "created_at": "<iso-timestamp>", "render_count": <int> }`

#### Scenario: Unauthenticated request
- **WHEN** a client sends `GET /api/auth/me` without a valid JWT
- **THEN** the system returns `401 Unauthorized`

### Requirement: Logout from profile
The system SHALL allow the user to log out from the profile page.

#### Scenario: User clicks logout
- **WHEN** the user clicks "Logout" on the profile page
- **THEN** the system calls `POST /api/auth/logout`
- **AND** clears the access token from localStorage
- **AND** redirects to the home page
- **AND** the guest session UUID remains in localStorage (user reverts to guest mode)
