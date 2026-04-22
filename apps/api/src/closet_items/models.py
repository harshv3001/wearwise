import uuid

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text

from src.database import Base


class ClosetItem(Base):
    __tablename__ = "closet_items"
    __table_args__ = (
        Index("ix_closet_items_season", "season", postgresql_using="gin"),
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
    category = Column(String, nullable=False, index=True)
    color = Column(String, nullable=True, index=True)
    secondary_colors = Column(ARRAY(String), nullable=True, default=list)
    season = Column(ARRAY(String), nullable=True, default=list)
    brand = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    store = Column(String, nullable=True)
    material = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    times_worn = Column(Integer, nullable=False, default=0)
    date_acquired = Column(Date, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=text("now()"))

    user = relationship("User")
