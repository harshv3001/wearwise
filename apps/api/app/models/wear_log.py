from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey, String, text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class WearLog(Base):
    __tablename__ = "wear_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    outfit_id = Column(
        Integer,
        ForeignKey("outfits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    date_worn = Column(Date, nullable=False, index=True)

    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=text("now()"))

    user = relationship("User")
    outfit = relationship("Outfit")

    __table_args__ = (
        UniqueConstraint("user_id", "outfit_id", "date_worn", name="uq_user_outfit_date"),
    )