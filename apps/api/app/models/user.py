from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import ARRAY
from app.database import Base
from sqlalchemy.sql.expression import text


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)

    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)

    country = Column(String, nullable=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)

    pref_styles = Column(ARRAY(String), nullable=True)
    pref_colors = Column(ARRAY(String), nullable=True)

    created_at = Column(
        TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False
    )
