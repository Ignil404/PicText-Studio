## Why

Current backend logging is minimal — no structured logs, no request context, no observability. Adding `structlog` with centralized configuration enables readable console output in dev, JSON logs for aggregation, and contextual logging (e.g., `request_id`, `user_id`) across all endpoints.

## What Changes

- Add a central `logger.py` module with `configure_logging()` and `get_logger()` helpers
- Require all backend modules use `structlog` via the central module, not plain `print` or `logging`
- Add log entries on startup, shutdown, and in health-check endpoints
- Add `structlog>=25.0.0` to dependencies

## Capabilities

### New Capabilities
- `structured-logging`: Centralized structured logging via `structlog` with console + JSON output, context binding, and a project convention that all modules use `get_logger(__name__)` from `logger.py`

### Modified Capabilities
- (none)

## Impact

- **New file**: `backend/logger.py`
- **New dependency**: `structlog` in `pyproject.toml`
- **Updated**: `backend/app.py` — calls `configure_logging()` at startup
- **Updated**: `backend/routers/health.py` — uses structured logger
- **Convention**: All future modules should import `get_logger` from `logger.py`
