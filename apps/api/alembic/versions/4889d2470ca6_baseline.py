"""baseline

Revision ID: 4889d2470ca6
Revises: 
Create Date: 2026-03-17 23:36:57.851525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '4889d2470ca6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(sa.text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))

    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password", sa.String(), nullable=False),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("gender", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("state", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("pref_styles", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("pref_colors", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "closet_items",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("color", sa.String(), nullable=True),
        sa.Column("season", sa.String(), nullable=True),
        sa.Column("brand", sa.String(), nullable=True),
        sa.Column("price", sa.Float(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("store", sa.String(), nullable=True),
        sa.Column("material", sa.String(), nullable=True),
        sa.Column("image_path", sa.String(), nullable=True),
        sa.Column("times_worn", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("date_acquired", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_closet_items_category"), "closet_items", ["category"], unique=False)
    op.create_index(op.f("ix_closet_items_color"), "closet_items", ["color"], unique=False)
    op.create_index(op.f("ix_closet_items_id"), "closet_items", ["id"], unique=False)
    op.create_index(op.f("ix_closet_items_season"), "closet_items", ["season"], unique=False)
    op.create_index(op.f("ix_closet_items_user_id"), "closet_items", ["user_id"], unique=False)

    op.create_table(
        "outfits",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("occasion", sa.String(), nullable=True),
        sa.Column("season", sa.String(), nullable=True),
        sa.Column("is_favorite", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("image_path", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_outfits_id"), "outfits", ["id"], unique=False)
    op.create_index(op.f("ix_outfits_occasion"), "outfits", ["occasion"], unique=False)
    op.create_index(op.f("ix_outfits_season"), "outfits", ["season"], unique=False)
    op.create_index(op.f("ix_outfits_user_id"), "outfits", ["user_id"], unique=False)

    op.create_table(
        "outfit_items",
        sa.Column("outfit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("closet_item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("note", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["closet_item_id"], ["closet_items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["outfit_id"], ["outfits.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("outfit_id", "closet_item_id"),
    )

    op.create_table(
        "wear_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("outfit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date_worn", sa.Date(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["outfit_id"], ["outfits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_wear_logs_date_worn"), "wear_logs", ["date_worn"], unique=False)
    op.create_index(op.f("ix_wear_logs_id"), "wear_logs", ["id"], unique=False)
    op.create_index(op.f("ix_wear_logs_outfit_id"), "wear_logs", ["outfit_id"], unique=False)
    op.create_index(op.f("ix_wear_logs_user_id"), "wear_logs", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_wear_logs_user_id"), table_name="wear_logs")
    op.drop_index(op.f("ix_wear_logs_outfit_id"), table_name="wear_logs")
    op.drop_index(op.f("ix_wear_logs_id"), table_name="wear_logs")
    op.drop_index(op.f("ix_wear_logs_date_worn"), table_name="wear_logs")
    op.drop_table("wear_logs")

    op.drop_table("outfit_items")

    op.drop_index(op.f("ix_outfits_user_id"), table_name="outfits")
    op.drop_index(op.f("ix_outfits_season"), table_name="outfits")
    op.drop_index(op.f("ix_outfits_occasion"), table_name="outfits")
    op.drop_index(op.f("ix_outfits_id"), table_name="outfits")
    op.drop_table("outfits")

    op.drop_index(op.f("ix_closet_items_user_id"), table_name="closet_items")
    op.drop_index(op.f("ix_closet_items_season"), table_name="closet_items")
    op.drop_index(op.f("ix_closet_items_id"), table_name="closet_items")
    op.drop_index(op.f("ix_closet_items_color"), table_name="closet_items")
    op.drop_index(op.f("ix_closet_items_category"), table_name="closet_items")
    op.drop_table("closet_items")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
