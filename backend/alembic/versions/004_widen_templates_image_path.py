"""widen templates.image_path to TEXT

Revision ID: 004
Revises: 003
Create Date: 2026-04-10
"""

import sqlalchemy as sa

from alembic import op

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "templates",
        "image_path",
        type_=sa.Text(),
        existing_type=sa.String(500),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "templates",
        "image_path",
        type_=sa.String(500),
        existing_type=sa.Text(),
        existing_nullable=False,
    )
