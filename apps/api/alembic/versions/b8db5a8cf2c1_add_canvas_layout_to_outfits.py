"""add canvas layout to outfits

Revision ID: b8db5a8cf2c1
Revises: 9f6f4f3b6c21
Create Date: 2026-04-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "b8db5a8cf2c1"
down_revision: Union[str, Sequence[str], None] = "9f6f4f3b6c21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "outfits",
        sa.Column("canvas_layout", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("outfits", "canvas_layout")
