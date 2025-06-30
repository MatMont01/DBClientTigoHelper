# src-tauri/python/app/models/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# --- Configuración de la Conexión a la Base de Datos ---
# Aquí debes reemplazar los valores con tus propias credenciales de SQL Server.
# Para mayor seguridad, es una buena práctica leer estos valores desde variables de entorno.
DB_DRIVER = 'ODBC Driver 17 for SQL Server'
DB_SERVER = os.environ.get('DB_SERVER', 'bicorporate')  # Reemplaza 'TU_SERVIDOR'
DB_DATABASE = os.environ.get('DB_DATABASE', 'BI_B2B')  # El nombre de tu base de datos
DB_USERNAME = os.environ.get('DB_USERNAME', 'BI_CX')  # Tu usuario de la base de datos
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'Telecel123')  # Reemplaza 'TU_CONTRASENA'

# Construimos la URL de conexión para SQLAlchemy.
DATABASE_URL = f"mssql+pyodbc://{DB_USERNAME}:{DB_PASSWORD}@{DB_SERVER}/{DB_DATABASE}?driver={DB_DRIVER}"

# --- Motor y Sesión de SQLAlchemy ---

# El 'engine' es el punto de entrada a nuestra base de datos.
# 'echo=True' es útil para depuración, ya que imprimirá en consola todas las consultas SQL que se ejecuten.
# Puedes quitarlo en producción para no llenar los logs.
engine = create_engine(DATABASE_URL, echo=False)

# 'SessionLocal' es una fábrica de sesiones. Cada instancia de SessionLocal será una nueva sesión con la BD.
# Una sesión agrupa un conjunto de operaciones (consultas) que se quieren realizar.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 'Base' es una clase base para nuestros modelos. Todos nuestros modelos de tablas heredarán de esta clase.
Base = declarative_base()


def get_db():
    """
    Función de utilidad para obtener una sesión de base de datos.
    Esto asegura que la sesión se cierre correctamente después de su uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
