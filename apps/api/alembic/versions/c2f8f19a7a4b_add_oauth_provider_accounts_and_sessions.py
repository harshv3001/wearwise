"""add oauth provider accounts and sessions

Revision ID: c2f8f19a7a4b
Revises: 3b2fd277b0af
Create Date: 2026-04-05 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "c2f8f19a7a4b"
down_revision: Union[str, Sequence[str], None] = "3b2fd277b0af"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "password", existing_type=sa.String(), nullable=True)
    op.add_column(
        "users", sa.Column("email_verified_at", sa.TIMESTAMP(timezone=True), nullable=True)
    )
    op.add_column(
        "users", sa.Column("email_verification_source", sa.String(), nullable=True)
    )

    op.create_table(
        "auth_provider_accounts",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("provider_user_id", sa.String(), nullable=False),
        sa.Column("provider_email", sa.String(), nullable=True),
        sa.Column("provider_email_verified", sa.Boolean(), nullable=True),
        sa.Column("provider_display_name", sa.String(), nullable=True),
        sa.Column("provider_avatar_url", sa.String(), nullable=True),
        sa.Column("access_token_encrypted", sa.String(), nullable=True),
        sa.Column("refresh_token_encrypted", sa.String(), nullable=True),
        sa.Column("token_expires_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("scopes", sa.String(), nullable=True),
        sa.Column("provider_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "linked_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("last_login_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("provider", "provider_user_id", name="uq_provider_user"),
        sa.UniqueConstraint("user_id", "provider", name="uq_user_provider"),
    )
    op.create_index(
        op.f("ix_auth_provider_accounts_id"),
        "auth_provider_accounts",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_auth_provider_accounts_user_id"),
        "auth_provider_accounts",
        ["user_id"],
        unique=False,
    )

    op.create_table(
        "auth_sessions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("refresh_token_hash", sa.String(), nullable=False),
        sa.Column("user_agent", sa.String(), nullable=True),
        sa.Column("ip_address", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("last_used_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_auth_sessions_id"), "auth_sessions", ["id"], unique=False)
    op.create_index(
        op.f("ix_auth_sessions_refresh_token_hash"),
        "auth_sessions",
        ["refresh_token_hash"],
        unique=True,
    )
    op.create_index(
        op.f("ix_auth_sessions_user_id"),
        "auth_sessions",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_auth_sessions_user_id"), table_name="auth_sessions")
    op.drop_index(op.f("ix_auth_sessions_refresh_token_hash"), table_name="auth_sessions")
    op.drop_index(op.f("ix_auth_sessions_id"), table_name="auth_sessions")
    op.drop_table("auth_sessions")

    op.drop_index(
        op.f("ix_auth_provider_accounts_user_id"),
        table_name="auth_provider_accounts",
    )
    op.drop_index(
        op.f("ix_auth_provider_accounts_id"),
        table_name="auth_provider_accounts",
    )
    op.drop_table("auth_provider_accounts")

    op.drop_column("users", "email_verification_source")
    op.drop_column("users", "email_verified_at")
    op.alter_column("users", "password", existing_type=sa.String(), nullable=False)
