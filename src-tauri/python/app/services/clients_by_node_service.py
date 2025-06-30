# src-tauri/python/app/services/clients_by_node_service.py
import sys
import pandas as pd
from sqlalchemy.orm import Session
from ..models.clients_by_node_model import CuboTrabajos


class ClientsByNodeService:
    def _get_processed_data(self, db_session: Session) -> pd.DataFrame:
        """
        Función central que consulta la base de datos y aplica la lógica de negocio final y correcta.
        """
        print("Servicio: Consultando datos desde la vista CUBO_TRABAJOS...", file=sys.stderr)
        query = db_session.query(CuboTrabajos)
        df = pd.read_sql(query.statement, db_session.bind)
        print(f"Servicio: {len(df)} registros obtenidos de la vista.", file=sys.stderr)

        # 1. Filtro de "Cronograma": nos quedamos solo con clientes que tengan un NODO asignado.
        df_filtered = df[df['NODO'].notna() & (df['NODO'] != '')].copy()
        print(f"Servicio: {len(df_filtered)} registros después de filtrar por clientes con NODO.", file=sys.stderr)

        # 2. Filtro de "IP Pública": nos quedamos con los clientes 'NEGOCIO EN LINEA'.
        public_ip_products = ['NEGOCIO EN LINEA']
        df_filtered = df_filtered[df_filtered['TIPO_PRODUCTO'].isin(public_ip_products)]
        print(f"Servicio: {len(df_filtered)} registros después de filtrar por IP Pública.", file=sys.stderr)

        # 3. FILTRO FINAL Y CORRECTO DE "B2B":
        # Basado en nuestra depuración, los segmentos B2B para esta tarea son 'LARGE', 'SMALL', y 'ENTERPRISE'.
        b2b_segments = ['LARGE', 'SMALL', 'ENTERPRISE']
        df_filtered = df_filtered[df_filtered['NUEVO_SEGMENTO'].str.upper().isin(b2b_segments)]
        print(f"Servicio: {len(df_filtered)} registros finales encontrados (B2B).", file=sys.stderr)

        # 4. Selección y Renombrado de Columnas Finales para el exportable.
        final_columns = {
            'NRO_CUENTA': 'NRO_CUENTA',
            'NOMBRE_CLIENTE': 'CLIENTE_NOMBRE_COMPLETO',
            'NODO': 'ZONA_GRUPO',
            'EJECUTIVO_CORPORATE': 'EJECUTIVO_CORPORATE',
            'EMAIL_IT': 'CORREO_TITULAR_PYME'
        }

        existing_columns = [col for col in final_columns.keys() if col in df_filtered.columns]
        df_final = df_filtered[existing_columns].rename(columns=final_columns)

        return df_final

    def get_preview(self, db_session: Session, max_rows: int = 20) -> list:
        """Devuelve los primeros N registros para la vista previa."""
        df = self._get_processed_data(db_session)
        return df.head(max_rows).to_dict(orient='records')

    def export_to_excel(self, db_session: Session, output_path: str):
        """Procesa los datos y los guarda en un archivo Excel."""
        df = self._get_processed_data(db_session)
        df.to_excel(output_path, index=False)
        return {"status": "success", "path": output_path}