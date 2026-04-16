"""009_add_template_is_active

Revision ID: 009_add_template_is_active
Revises: 009_alter_role_to_string
Create Date: 2026-04-16
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

revision = "009_add_template_is_active"
down_revision = "009_alter_role_to_string"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "templates",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
    )


def downgrade() -> None:
    op.drop_column("templates", "is_active")
