"""add layer to outfit items

Revision ID: 9f6f4f3b6c21
Revises: 062db1fc7f89
Create Date: 2026-04-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f6f4f3b6c21"
down_revision: Union[str, Sequence[str], None] = "062db1fc7f89"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "outfit_items",
        sa.Column("layer", sa.Integer(), nullable=False, server_default="1"),
    )


def downgrade() -> None:
    op.drop_column("outfit_items", "layer")
