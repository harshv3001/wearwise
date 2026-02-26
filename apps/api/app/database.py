from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# DATABASE_URL = (
#     f"postgresql+psycopg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
#     f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.POSTGRES_DB}"
# )
DATABASE_URL = settings.database_url

print("DATABASE_URL:", DATABASE_URL)  # Debug print to check the URL
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
