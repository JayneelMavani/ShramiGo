from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


is_sqlite = "sqlite" in settings.effective_database_url
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    settings.effective_database_url,
    pool_pre_ping=not is_sqlite,
    connect_args=connect_args,
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()