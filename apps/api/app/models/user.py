import uuid

from sqlalchemy import Column, Float, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.database import Base
from sqlalchemy.sql.expression import text


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    # name = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)

    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)

    country = Column(String, nullable=True)
    country_code = Column(String, nullable=True)
    state = Column(String, nullable=True)
    state_code = Column(String, nullable=True)
    city = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    pref_styles = Column(ARRAY(String), nullable=True)
    pref_colors = Column(ARRAY(String), nullable=True)

    created_at = Column(
        TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False
    )
