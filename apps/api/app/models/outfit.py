from sqlalchemy import Column, Integer
from sqlalchemy.orm import relationship, Mapped
from typing import Set

outfits_closet_items = Table(
    "outfits_closet_items",
    Base.metadata,
    Column("outfit_id", ForeignKey("outfits.id"), primary_key=True),
    Column("closet_item_id", ForeignKey("closet_items.id"), primary_key=True)
)

class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=text("now()"))

    user = relationship("User")
    closet_items: Mapped[Set["ClosetItem"]] = relationship(secondary=outfits_closet_items)
