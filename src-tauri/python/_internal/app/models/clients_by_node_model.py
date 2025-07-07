# src-tauri/python/app/models/clients_by_node_model.py
from sqlalchemy import Column, String, Numeric
from .database import Base


class CacheCuboCarteras(Base):
    """
    Modelo ORM para la vista 'VISTAS_CACHE_CUBO_CARTERAS'.
    Nuestra fuente principal de datos de clientes.
    """
    __tablename__ = 'VISTAS_CACHE_CUBO_CARTERAS'

    NRO_CUENTA = Column(Numeric, primary_key=True)
    NOMBRE_CLIENTE = Column(String)
    NODO = Column(String)
    EJECUTIVO_CORPORATE = Column(String)
    CORREO_TITULAR_PYME = Column(String)
    TELEFONO_CONTACTO = Column(String)
    TIPO_PRODUCTO = Column(String)
    # No necesitamos más columnas de esta vista para la tarea actual.


# --- NUEVO MODELO AÑADIDO ---
class ClientesIp(Base):
    """
    Nuevo modelo ORM para la vista que contiene la bandera de IP Pública.
    Asumimos que la vista se llama 'VISTA_TIENE_IP'.
    """
    __tablename__ = 'VISTA_TIENE_IP'  # Puedes cambiar esto si la vista se llama diferente

    # La clave primaria es el número de cliente, que usaremos para unir los datos.
    CLIENTENRO = Column(Numeric, primary_key=True)
    BANDERA_IP = Column(String)
