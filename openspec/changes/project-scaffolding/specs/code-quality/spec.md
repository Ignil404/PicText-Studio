## ADDED Requirements

### Requirement: ruff linter and formatter
The backend SHALL use ruff as the Python linter and formatter. Configuration SHALL be in `pyproject.toml`.

#### Scenario: Linting runs successfully
- **WHEN** `ruff check` is executed in the backend directory
- **THEN** it reports zero violations on passing code

#### Scenario: Formatting check
- **WHEN** `ruff format --check` is executed
- **THEN** it reports zero formatting differences on properly formatted code

### Requirement: mypy type checking
The backend SHALL use mypy for static type checking with `--strict` mode enabled.

#### Scenario: Type checking passes
- **WHEN** `mypy .` is executed in the backend directory
- **THEN** it reports zero type errors on correctly typed code

### Requirement: pytest test runner
The backend SHALL use pytest as the test framework. Tests SHALL live in `backend/tests/`. A test configuration SHALL be in `pyproject.toml` or `pytest.ini`.

#### Scenario: Test discovery works
- **WHEN** `pytest` is executed in the backend directory
- **THEN** it discovers and runs all tests under `tests/`

#### Scenario: Test output is visible
- **WHEN** tests run
- **THEN** pytest outputs pass/fail status per test with readable tracebacks on failure

### Requirement: Pre-commit hooks
A pre-commit configuration SHALL exist to run ruff and mypy before each commit.

#### Scenario: Pre-commit runs on commit
- **WHEN** `git commit` is executed
- **THEN** pre-commit validates the staged files with ruff and mypy

#### Scenario: Failing checks block commit
- **WHEN** a pre-commit check fails
- **THEN** the commit is rejected with an error message

### Requirement: Code formatting automation
The project SHALL provide a `make lint` or `scripts/lint.sh` command that runs all code quality checks.

#### Scenario: Single command runs all checks
- **WHEN** the lint command is executed
- **THEN** ruff check, ruff format, and mypy all run in sequence
