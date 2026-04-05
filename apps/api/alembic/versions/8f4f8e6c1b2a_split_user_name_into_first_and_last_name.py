"""split user name into first and last name

Revision ID: 8f4f8e6c1b2a
Revises: 062db1fc7f89
Create Date: 2026-04-05 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8f4f8e6c1b2a"
down_revision: Union[str, Sequence[str], None] = "062db1fc7f89"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("first_name", sa.String(), nullable=True))
    op.add_column("users", sa.Column("last_name", sa.String(), nullable=True))

    # Small dev database: remove existing users instead of backfilling names.
    op.execute(sa.text("DELETE FROM users"))

    op.alter_column("users", "first_name", existing_type=sa.String(), nullable=False)
    op.alter_column("users", "last_name", existing_type=sa.String(), nullable=False)
    op.drop_column("users", "name")


def downgrade() -> None:
    op.add_column("users", sa.Column("name", sa.String(), nullable=True))

    op.execute(
        sa.text(
            """
            UPDATE users
            SET name = BTRIM(
                CONCAT(
                    COALESCE(first_name, ''),
                    CASE
                        WHEN NULLIF(last_name, '') IS NULL THEN ''
                        ELSE ' ' || last_name
                    END
                )
            )
            """
        )
    )

    op.alter_column("users", "name", existing_type=sa.String(), nullable=False)
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")
