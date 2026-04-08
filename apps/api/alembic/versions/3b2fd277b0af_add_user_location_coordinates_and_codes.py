"""add user location coordinates and codes

Revision ID: 3b2fd277b0af
Revises: 8f4f8e6c1b2a
Create Date: 2026-04-05 00:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3b2fd277b0af"
down_revision: Union[str, Sequence[str], None] = "8f4f8e6c1b2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("country_code", sa.String(), nullable=True))
    op.add_column("users", sa.Column("state_code", sa.String(), nullable=True))
    op.add_column("users", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("users", sa.Column("longitude", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "longitude")
    op.drop_column("users", "latitude")
    op.drop_column("users", "state_code")
    op.drop_column("users", "country_code")
