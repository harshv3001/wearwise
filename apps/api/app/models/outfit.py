import uuid

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean,
    ForeignKey, text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Outfit(Base):
    __tablename__ = "outfits"

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

    name = Column(String, nullable=False)

    occasion = Column(String, nullable=True, index=True)
    season = Column(String, nullable=True, index=True)
    is_favorite = Column(Boolean, nullable=False, server_default=text("false"))
    notes = Column(String, nullable=True)
    image_path = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=text("now()"))

    user = relationship("User")

    outfit_items = relationship(
        "OutfitItem",
        back_populates="outfit",
        cascade="all, delete-orphan",
        order_by="OutfitItem.position",
    )


class OutfitItem(Base):
    __tablename__ = "outfit_items"

    outfit_id = Column(
        UUID(as_uuid=True),
        ForeignKey("outfits.id", ondelete="CASCADE"),
        primary_key=True,
    )

    closet_item_id = Column(
        UUID(as_uuid=True),
        ForeignKey("closet_items.id", ondelete="CASCADE"),
        primary_key=True,
    )

    position = Column(Integer, nullable=False, server_default=text("0"))
    note = Column(String, nullable=True)
    outfit = relationship("Outfit", back_populates="outfit_items")
    closet_item = relationship("ClosetItem")
