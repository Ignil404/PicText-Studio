"""011_add_missing_columns

Revision ID: 012
Revises: 011
Create Date: 2026-04-19
"""

from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

from alembic import op

revision = "012"
down_revision = "011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "templates",
        sa.Column("slug", sa.String(255), nullable=False, unique=True),
    )
    op.create_index("ix_templates_slug", "templates", ["slug"])

    op.add_column(
        "render_history",
        sa.Column(
            "sticker_blocks", JSONB, nullable=False, server_default="[]"
        ),
    )
    op.add_column(
        "render_history",
        sa.Column(
            "shape_blocks", JSONB, nullable=False, server_default="[]"
        ),
    )
    op.add_column(
        "render_history",
        sa.Column(
            "remix_parent_id",
            UUID(as_uuid=True),
            sa.ForeignKey("render_history.id"),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("render_history", "remix_parent_id")
    op.drop_column("render_history", "shape_blocks")
    op.drop_column("render_history", "sticker_blocks")
    op.drop_index("ix_templates_slug", table_name="templates")
    op.drop_column("templates", "slug")
