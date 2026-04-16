"""007_add_user_role

Revision ID: 007_add_user_role
Revises: 006_add_owner_to_history
Create Date: 2026-04-16
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "007_add_user_role"
down_revision = "006_add_owner_to_history"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum type for user roles
    role_enum = sa.Enum("user", "admin", name="userrole")
    role_enum.create(op.get_bind())

    # Add role column with default 'user'
    op.add_column(
        "users",
        sa.Column("role", role_enum, nullable=False, server_default="user"),
    )


def downgrade() -> None:
    op.drop_column("users", "role")

    # Drop enum type
    role_enum = sa.Enum("user", "admin", name="userrole")
    role_enum.drop(op.get_bind())
