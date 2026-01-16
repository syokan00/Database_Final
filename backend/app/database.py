from dotenv import load_dotenv
import os
from urllib.parse import urlparse, urlunparse

# 在所有其他导入之前加载环境变量
load_dotenv()

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required. Please set it in .env file.")

# Parse database URL and handle database creation if needed
parsed = urlparse(DATABASE_URL)
db_name = parsed.path.lstrip('/') if parsed.path else 'postgres'

# If database name is 'memoluck' but it doesn't exist, try to create it
if db_name == 'memoluck':
    try:
        # First, try to connect to the database
        test_engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 5})
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        test_engine.dispose()
        print(f"Successfully connected to database '{db_name}'")
    except Exception as e:
        # If connection fails, try to create the database
        error_msg = str(e).lower()
        if "does not exist" in error_msg or "database" in error_msg:
            print(f"Database '{db_name}' does not exist, attempting to create it...")
            try:
                # Connect to default 'postgres' database to create new database
                default_db_url = urlunparse(parsed._replace(path='/postgres'))
                default_engine = create_engine(default_db_url, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 5})
                with default_engine.connect() as conn:
                    result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'memoluck'"))
                    if not result.fetchone():
                        conn.execute(text("CREATE DATABASE memoluck"))
                        print("Database 'memoluck' created successfully")
                    else:
                        print("Database 'memoluck' already exists")
                default_engine.dispose()
                # Wait a moment for database to be ready
                import time
                time.sleep(1)
            except Exception as create_error:
                print(f"Warning: Could not create database automatically: {create_error}")
                print("Please manually create the database 'memoluck' in Render PostgreSQL")
                print("Or update DATABASE_URL to use an existing database name")
                # Try using 'postgres' as fallback
                DATABASE_URL = urlunparse(parsed._replace(path='/postgres'))
                print(f"Falling back to default 'postgres' database")
        else:
            # Other connection errors, just print warning
            print(f"Warning: Database connection issue: {e}")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
