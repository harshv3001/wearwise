"""merge alembic heads

Revision ID: 6f49c2c69cc7
Revises: a91f5c4d2e10, b8db5a8cf2c1
Create Date: 2026-04-16 16:59:09.927652

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f49c2c69cc7'
down_revision: Union[str, Sequence[str], None] = ('a91f5c4d2e10', 'b8db5a8cf2c1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
