# src-tauri/python/app/models/database.py
import os
import sys
import pytds
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# --- Configuración de la Conexión ---
DB_SERVER = os.environ.get('DB_SERVER', 'bicorporate')
DB_DATABASE = os.environ.get('DB_DATABASE', 'BI_B2B')
DB_USERNAME = os.environ.get('DB_USERNAME', 'BI_CX')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'Telecel123')
DB_PORT = 1433

# --- URL de Conexión ---
DATABASE_URL = (
    f"mssql+pytds://{DB_USERNAME}:{DB_PASSWORD}@{DB_SERVER}:{DB_PORT}/{DB_DATABASE}"
)

# --- El resto del archivo se mantiene igual ---
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()