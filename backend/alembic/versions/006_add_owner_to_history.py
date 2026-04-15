"""006_add_owner_to_history

Revision ID: 006_add_owner_to_history
Revises: 005_create_users
Create Date: 2026-04-14
"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

from alembic import op

revision = "006_add_owner_to_history"
down_revision = "005_create_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make session_id nullable (existing rows keep their values)
    op.alter_column("render_history", "session_id", existing_type=sa.String(255), nullable=True)

    # Add owner_id FK
    op.add_column(
        "render_history",
        sa.Column("owner_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )
    op.create_index("ix_render_history_owner_id", "render_history", ["owner_id"])


def downgrade() -> None:
    op.drop_index("ix_render_history_owner_id", table_name="render_history")
    op.drop_column("render_history", "owner_id")
    # Restore session_id as NOT NULL — but only safe if no NULL rows exist
    op.alter_column("render_history", "session_id", existing_type=sa.String(255), nullable=False)
