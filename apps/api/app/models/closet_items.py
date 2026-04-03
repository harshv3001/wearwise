import uuid

from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql.expression import text


class ClosetItem(Base):
    __tablename__ = "closet_items"

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
    season = Column(String, nullable=True, index=True, default="all")
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
