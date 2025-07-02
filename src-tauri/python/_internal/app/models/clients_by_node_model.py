# src-tauri/python/app/models/clients_by_node_model.py
from sqlalchemy import Column, String, Numeric
from .database import Base

class CacheCuboCarteras(Base):
    """
    Modelo ORM que representa la vista 'VISTAS_CACHE_CUBO_CARTERAS'.
    Versión final y correcta, con el nombre de clase y las columnas alineadas.
    """
    __tablename__ = 'VISTAS_CACHE_CUBO_CARTERAS'

    # Clave primaria
    NRO_CUENTA = Column(Numeric, primary_key=True)

    # --- COLUMNAS CORRECTAS DE LA VISTA ---
    NOMBRE_CLIENTE = Column(String)
    # Usamos la columna NODO que ya existe en la vista.
    NODO = Column(String)
    EJECUTIVO_CORPORATE = Column(String)
    # Usamos las columnas de contacto correctas.
    CORREO_TITULAR_PYME = Column(String)
    TELEFONO_CONTACTO = Column(String)
    TIPO_PRODUCTO = Column(String)