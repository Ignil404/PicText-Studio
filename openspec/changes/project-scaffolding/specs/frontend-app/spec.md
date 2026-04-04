## ADDED Requirements

### Requirement: Vite-based frontend project
The frontend SHALL be scaffolded as a Vite project with its own independent build pipeline, separate from the backend service.

#### Scenario: Vite dev server starts
- **WHEN** the Vite dev server is started
- **THEN** it serves a page at `localhost` on its own port without errors

#### Scenario: Build succeeds
- **WHEN** the Vite build command is run
- **THEN** it produces optimized static assets in a `dist/` directory

### Requirement: Frontend/backend API proxy
The frontend development server SHALL proxy API requests to the backend service. The proxy configuration SHALL be in the Vite config.

#### Scenario: API call is proxied in dev
- **WHEN** the frontend makes a request to `/api/...` during development
- **THEN** the request is forwarded to the backend service automatically

#### Scenario: Frontend builds independently
- **WHEN** the frontend is built without the backend running
- **THEN** the build completes successfully

### Requirement: Separate frontend directory
The frontend SHALL live in its own top-level directory (`frontend/`) with independent `package.json`, build configuration, and Dockerfile.

#### Scenario: Frontend directory structure
- **WHEN** the project root is listed
- **THEN** a `frontend/` directory exists with its own `package.json` and `vite.config.*`

#### Scenario: Independent npm scripts
- **WHEN** `npm run dev` is executed in the frontend directory
- **THEN** it does not require any backend files to start