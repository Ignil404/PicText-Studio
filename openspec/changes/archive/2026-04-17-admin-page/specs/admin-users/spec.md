## ADDED Requirements

### Requirement: List users
The system SHALL provide a paginated list of all registered users with search functionality.

#### Scenario: View user list
- **WHEN** admin opens `/admin/users`
- **THEN** the system displays a table with columns: ID, Email, Role, Created At, Status, Actions
- **AND** supports server-side pagination

#### Scenario: Search users
- **WHEN** admin types an email in the search box
- **THEN** the system filters users by email (ILIKE match)
- **AND** results update with debounce

### Requirement: View user details
The system SHALL allow admins to view detailed information about a specific user.

#### Scenario: Open user details
- **WHEN** admin clicks on a user row or "View Details"
- **THEN** the system opens a modal or drawer showing:
  - User email, created_at, role
  - Total renders count
  - Last active timestamp
  - Recent render history (last 5 renders)

### Requirement: Block/Unblock user
The system SHALL allow admins to block or unblock user accounts.

#### Scenario: Block user
- **WHEN** admin clicks "Block" on a user
- **AND** confirms in a modal dialog
- **THEN** the user's `is_blocked` flag is set to true
- **AND** all their active sessions are invalidated (tokens revoked)

#### Scenario: Unblock user
- **WHEN** admin clicks "Unblock" on a blocked user
- **THEN** the user's `is_blocked` flag is set to false
- **AND** the user can log in again normally

#### Scenario: Blocked user tries to login
- **WHEN** a blocked user attempts to login
- **THEN** the system returns `403 Forbidden` with message "Account has been blocked"
