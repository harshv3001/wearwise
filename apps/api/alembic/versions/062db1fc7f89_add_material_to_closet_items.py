"""add material to closet_items

Revision ID: 062db1fc7f89
Revises: 4889d2470ca6
Create Date: 2026-03-17 23:40:13.736497

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '062db1fc7f89'
down_revision: Union[str, Sequence[str], None] = '4889d2470ca6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # No-op for fresh databases: material now exists in the baseline schema.
    return


def downgrade() -> None:
    """Downgrade schema."""
    return
