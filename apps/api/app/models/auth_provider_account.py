import uuid

from sqlalchemy import Boolean, Column, ForeignKey, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql.expression import text

from app.database import Base


class AuthProviderAccount(Base):
    __tablename__ = "auth_provider_accounts"
    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_provider_user"),
        UniqueConstraint("user_id", "provider", name="uq_user_provider"),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider = Column(String, nullable=False)
    provider_user_id = Column(String, nullable=False)
    provider_email = Column(String, nullable=True)
    provider_email_verified = Column(Boolean, nullable=True)
    provider_display_name = Column(String, nullable=True)
    provider_avatar_url = Column(String, nullable=True)
    access_token_encrypted = Column(String, nullable=True)
    refresh_token_encrypted = Column(String, nullable=True)
    token_expires_at = Column(TIMESTAMP(timezone=True), nullable=True)
    scopes = Column(String, nullable=True)
    provider_metadata = Column(JSONB, nullable=True)
    linked_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    last_login_at = Column(TIMESTAMP(timezone=True), nullable=True)

