"""create render_history table

Revision ID: 003
Revises: 002
Create Date: 2026-04-06
"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

from alembic import op

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "render_history",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("session_id", sa.String(255), nullable=False),
        sa.Column("template_id", UUID(as_uuid=True), sa.ForeignKey("templates.id"), nullable=False),
        sa.Column("text_blocks", JSONB, nullable=False),
        sa.Column("image_path", sa.String(500), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_render_history_session_id", "render_history", ["session_id"])


def downgrade() -> None:
    op.drop_index("ix_render_history_session_id", table_name="render_history")
    op.drop_table("render_history")
