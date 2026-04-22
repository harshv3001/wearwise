"""convert item and outfit fields to arrays

Revision ID: f15c3b5b8a72
Revises: 6f49c2c69cc7
Create Date: 2026-04-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "f15c3b5b8a72"
down_revision: Union[str, Sequence[str], None] = "6f49c2c69cc7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "closet_items",
        sa.Column("secondary_colors", postgresql.ARRAY(sa.String()), nullable=True),
    )

    op.drop_index("ix_closet_items_season", table_name="closet_items")
    op.drop_index("ix_outfits_occasion", table_name="outfits")
    op.drop_index("ix_outfits_season", table_name="outfits")

    op.alter_column(
        "closet_items",
        "season",
        existing_type=sa.String(),
        type_=postgresql.ARRAY(sa.String()),
        postgresql_using="""
        CASE
            WHEN season IS NULL OR btrim(season) = '' THEN ARRAY[]::varchar[]
            ELSE ARRAY[season]
        END
        """,
    )
    op.alter_column(
        "outfits",
        "occasion",
        existing_type=sa.String(),
        type_=postgresql.ARRAY(sa.String()),
        postgresql_using="""
        CASE
            WHEN occasion IS NULL OR btrim(occasion) = '' THEN ARRAY[]::varchar[]
            ELSE ARRAY[occasion]
        END
        """,
    )
    op.alter_column(
        "outfits",
        "season",
        existing_type=sa.String(),
        type_=postgresql.ARRAY(sa.String()),
        postgresql_using="""
        CASE
            WHEN season IS NULL OR btrim(season) = '' THEN ARRAY[]::varchar[]
            ELSE ARRAY[season]
        END
        """,
    )

    op.execute(
        sa.text(
            """
            UPDATE closet_items
            SET secondary_colors = ARRAY[]::varchar[]
            WHERE secondary_colors IS NULL
            """
        )
    )

    op.create_index(
        "ix_closet_items_season",
        "closet_items",
        ["season"],
        unique=False,
        postgresql_using="gin",
    )
    op.create_index(
        "ix_outfits_occasion",
        "outfits",
        ["occasion"],
        unique=False,
        postgresql_using="gin",
    )
    op.create_index(
        "ix_outfits_season",
        "outfits",
        ["season"],
        unique=False,
        postgresql_using="gin",
    )


def downgrade() -> None:
    op.drop_index("ix_closet_items_season", table_name="closet_items")
    op.drop_index("ix_outfits_occasion", table_name="outfits")
    op.drop_index("ix_outfits_season", table_name="outfits")

    op.alter_column(
        "closet_items",
        "season",
        existing_type=postgresql.ARRAY(sa.String()),
        type_=sa.String(),
        postgresql_using="""
        CASE
            WHEN coalesce(array_length(season, 1), 0) = 0 THEN NULL
            ELSE season[1]
        END
        """,
    )
    op.alter_column(
        "outfits",
        "occasion",
        existing_type=postgresql.ARRAY(sa.String()),
        type_=sa.String(),
        postgresql_using="""
        CASE
            WHEN coalesce(array_length(occasion, 1), 0) = 0 THEN NULL
            ELSE occasion[1]
        END
        """,
    )
    op.alter_column(
        "outfits",
        "season",
        existing_type=postgresql.ARRAY(sa.String()),
        type_=sa.String(),
        postgresql_using="""
        CASE
            WHEN coalesce(array_length(season, 1), 0) = 0 THEN NULL
            ELSE season[1]
        END
        """,
    )

    op.create_index("ix_closet_items_season", "closet_items", ["season"], unique=False)
    op.create_index("ix_outfits_occasion", "outfits", ["occasion"], unique=False)
    op.create_index("ix_outfits_season", "outfits", ["season"], unique=False)

    op.drop_column("closet_items", "secondary_colors")
