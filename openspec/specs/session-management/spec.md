## MODIFIED Requirements

### Requirement: Client session ID generation
The system SHALL generate a unique session identifier using `crypto.randomUUID()` on the client's first visit to the application. This session ID is used for guest-mode operation and for migrating guest renders to a user account on login.

#### Scenario: First visit — no existing session
- **WHEN** the application loads and no `session_id` exists in `localStorage`
- **THEN** the system generates a new UUID via `crypto.randomUUID()` and stores it in `localStorage` under the key `session_id`

#### Scenario: Returning visit — existing session
- **WHEN** the application loads and a `session_id` already exists in `localStorage`
- **THEN** the system reuses the existing `session_id` without generating a new one

### Requirement: Session ID inclusion in API requests
The system SHALL include the `session_id` in the request body of `POST /api/render` calls when the user is in guest mode. When the user is authenticated, the `session_id` is optional (the server identifies the user via JWT).

#### Scenario: Guest render includes session_id
- **WHEN** a guest user sends a render request to `POST /api/render`
- **THEN** the request body includes the `session_id` field with the value from `localStorage`

#### Scenario: Authenticated render
- **WHEN** a logged-in user sends a render request to `POST /api/render`
- **THEN** the request includes a valid `Authorization: Bearer <jwt>` header
- **AND** the server identifies the user via the JWT `sub` claim
- **AND** the `session_id` field is optional but may still be included for audit

### Requirement: Session ID access
The system SHALL provide a utility function to retrieve the current session ID from `localStorage`.

#### Scenario: Retrieve session ID
- **WHEN** any module calls `getSessionId()`
- **THEN** the function returns the `session_id` string from `localStorage`

### Requirement: Auth context for token management
The system SHALL provide an `AuthContext` that manages both guest session state and authenticated user state.

#### Scenario: Auth context provides unified state
- **WHEN** a component consumes `useAuth()`
- **THEN** the context provides `{ sessionId, user, accessToken, isLoading, isAuthenticated, login, logout, register }`
- **AND** `isAuthenticated` is `true` when `accessToken` is present, `false` otherwise
- **AND** `sessionId` is always available (even when authenticated) for guest→user migration
