# src-tauri/python/app/models/clients_by_node_model.py

from sqlalchemy import Column, String, Float, Integer
from .database import Base


# --- Modelos ORM para las Tablas de la Base de Datos ---

class CetClientesB2C(Base):
    """
    Modelo ORM que representa la tabla 'CET_CLIENTES_B2C'.

    Cada atributo de la clase corresponde a una columna de la tabla.
    SQLAlchemy usará esta clase para realizar consultas (SELECT, etc.)
    y mapear los resultados a objetos de Python.
    """
    __tablename__ = 'CET_CLIENTES_B2C'

    # Es importante definir al menos una columna como clave primaria (primary_key=True)
    # para que SQLAlchemy pueda identificar de forma única cada fila.
    # Aunque tu tabla original no la tenga definida, es una buena práctica añadirla
    # para el ORM. Usaremos NRO_CUENTA como clave si es único.
    NRO_CUENTA = Column(String(255), primary_key=True, index=True)
    PERIODO = Column(String(255))
    EJECUTIVO_CORPORATE = Column(String(255))
    COD_CLIENTE = Column(String(255))
    TIPO_BILLING = Column(String(255))
    COD_PLAN_CONSUMO = Column(String(255))
    ESTADO = Column(String(255))
    FECHA_HABILITACION = Column(String(255))
    TOT_FACTURADO = Column(String(255))
    SITUACION_EQUIPO = Column(String(255))
    DESCRIPCION_PLAN = Column(String(255))
    DESCRIPCION_PLAN_SVA = Column(String(255))
    TBM = Column(Float)
    COSTO_SERVICIO_SVA = Column(Float)
    COSTO_SERVICIO_TELEGROUP = Column(Float)
    CLOSING_MIC = Column(String(255))
    COSTO_SMARTAPP = Column(String(255))
    DESCRIP_AGREGADO_SVA = Column(String(255))
    COSTO_AGREGADO_SVA = Column(Float)
    ADDON_70MIN = Column(Float)
    WHATSAPP_ILIMITADO = Column(Float)
    ADDON_85MIN_1000MB = Column(Float)
    ADDON_CREDITO = Column(Float)


class BbdPlanesKpi(Base):
    """
    Modelo ORM que representa la tabla 'BBD_PLANES_KPI'.

    Esta tabla contiene los KPIs de los planes de consumo, que antes
    probablemente tenías en uno de tus archivos Excel.
    """
    __tablename__ = 'BBD_PLANES_KPI'

    # Aquí, 'PLAN_CONSUMO' parece ser el identificador único.
    PLAN_CONSUMO = Column(String(60), primary_key=True, index=True)
    PROMEDIO = Column(Float)
    MEDIANA = Column(Integer)
    MODA = Column(Integer)
    MINIMO = Column(Integer)
    MAXIMO = Column(Integer)


class CuboTrabajos(Base):
    """
    Modelo ORM que representa la vista 'CUBO_TRABAJOS'.
    Contiene la información consolidada de clientes que necesitamos.
    """
    __tablename__ = 'CUBO_TRABAJOS'

    # SQLAlchemy necesita al menos una columna como clave primaria para funcionar.
    NRO_CUENTA = Column(String, primary_key=True)
    NOMBRE_CLIENTE = Column(String)
    NODO = Column(String)
    EJECUTIVO_CORPORATE = Column(String)
    EMAIL_IT = Column(String)
    TIPO_PRODUCTO = Column(String)
    NUEVO_SEGMENTO = Column(String)
