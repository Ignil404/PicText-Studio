"""create shared_images table

Revision ID: 011
Revises: 009_add_template_is_active
Create Date: 2026-04-17
"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

from alembic import op

revision = "011"
down_revision = "009_add_template_is_active"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "shared_images",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "render_history_id",
            UUID(as_uuid=True),
            sa.ForeignKey("render_history.id"),
            nullable=False,
        ),
        sa.Column("share_id", sa.String(20), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_shared_images_share_id", "shared_images", ["share_id"])


def downgrade() -> None:
    op.drop_index("ix_shared_images_share_id", table_name="shared_images")
    op.drop_table("shared_images")
