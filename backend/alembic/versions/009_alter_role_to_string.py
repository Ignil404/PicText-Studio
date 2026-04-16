"""009_alter_role_to_string

Revision ID: 009_alter_role_to_string
Revises: 008_add_user_blocked
Create Date: 2026-04-16
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "009_alter_role_to_string"
down_revision = "008_add_user_blocked"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop default value that depends on enum
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")

    # Alter role column from enum to varchar
    op.alter_column(
        "users",
        "role",
        type_=sa.String(10),
        postgresql_using="role::varchar",
        existing_nullable=False,
    )

    # Add new default
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'")

    # Drop the enum type
    op.execute("DROP TYPE IF EXISTS userrole")


def downgrade() -> None:
    # Recreate enum type
    role_enum = sa.Enum("user", "admin", name="userrole")
    role_enum.create(op.get_bind())

    # Alter column back to enum
    op.alter_column(
        "users",
        "role",
        type_=role_enum,
        postgresql_using="role::userrole",
        existing_nullable=False,
    )
