import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

# Read database URL, fallback to local SQLite for immediate execution / zero-config demo
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./stayhub.db")

# Detect if we are using SQLite to apply special thread arguments
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    FastAPI dependency injection to yield a database session
    and automatically close it after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Creates all defined database tables inside the target database if not present.
    """
    Base.metadata.create_all(bind=engine)
