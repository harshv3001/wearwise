import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import relationship

from src.database import Base


class Outfit(Base):
    __tablename__ = "outfits"
    __table_args__ = (
        Index("ix_outfits_occasion", "occasion", postgresql_using="gin"),
        Index("ix_outfits_season", "season", postgresql_using="gin"),
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
    name = Column(String, nullable=False)
    occasion = Column(ARRAY(String), nullable=True, default=list)
    season = Column(ARRAY(String), nullable=True, default=list)
    is_favorite = Column(Boolean, nullable=False, server_default=text("false"))
    notes = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    canvas_layout = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=text("now()"))

    user = relationship("User")
    outfit_items = relationship(
        "OutfitItem",
        back_populates="outfit",
        cascade="all, delete-orphan",
        order_by=lambda: (OutfitItem.position.asc(), OutfitItem.layer.asc()),
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
    layer = Column(Integer, nullable=False, server_default=text("1"))
    note = Column(String, nullable=True)

    outfit = relationship("Outfit", back_populates="outfit_items")
    closet_item = relationship("ClosetItem")
