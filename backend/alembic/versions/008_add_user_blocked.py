"""008_add_user_blocked

Revision ID: 008_add_user_blocked
Revises: 007_add_user_role
Create Date: 2026-04-16
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "008_add_user_blocked"
down_revision = "007_add_user_role"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_blocked column with default False
    op.add_column(
        "users",
        sa.Column("is_blocked", sa.Boolean(), nullable=False, server_default="false"),
    )

    # Create index for faster blocked user queries
    op.create_index("ix_users_is_blocked", "users", ["is_blocked"])


def downgrade() -> None:
    op.drop_index("ix_users_is_blocked", table_name="users")
    op.drop_column("users", "is_blocked")
