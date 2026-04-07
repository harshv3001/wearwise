"""add user profile fields

Revision ID: a91f5c4d2e10
Revises: c2f8f19a7a4b
Create Date: 2026-04-06 15:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a91f5c4d2e10"
down_revision: Union[str, Sequence[str], None] = "c2f8f19a7a4b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(), nullable=True))
    op.add_column("users", sa.Column("image_path", sa.String(), nullable=True))
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_column("users", "image_path")
    op.drop_column("users", "username")
