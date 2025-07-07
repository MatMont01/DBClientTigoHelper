# src-tauri/python/app/services/clients_by_node_service.py
import sys
import pandas as pd
from sqlalchemy.orm import Session
# 1. Importamos los dos modelos que ahora necesitamos
from ..models.clients_by_node_model import CacheCuboCarteras, ClientesIp
import re


class ClientsByNodeService:
    def _normalize_nodo(self, nodo_text: str) -> str:
        """Limpia y estandariza los nombres de los nodos."""
        if not isinstance(nodo_text, str):
            return ''
        return nodo_text.upper().replace('NODO', '').strip()

    def _get_processed_data(self, db_session: Session, cronograma_excel_path: str, ip_filter: str) -> pd.DataFrame:
        """
        Función central que lee, consulta, une, filtra y cruza todos los datos.
        """
        print("Servicio: Iniciando procesamiento.", file=sys.stderr)

        # 1. Leer y normalizar el cronograma
        try:
            df_cronograma = pd.read_excel(cronograma_excel_path, sheet_name=0)
            cronograma_node_column = 'NODO_N'
            fecha_column = 'FECHA TRABAJO'

            if cronograma_node_column not in df_cronograma.columns or fecha_column not in df_cronograma.columns:
                raise ValueError(
                    f"Columnas requeridas ('{cronograma_node_column}', '{fecha_column}') no encontradas en el Excel.")

            df_cronograma['NODO_NORMALIZADO'] = df_cronograma[cronograma_node_column].apply(self._normalize_nodo)
            df_cronograma[fecha_column] = pd.to_datetime(df_cronograma[fecha_column], errors='coerce')
            df_cronograma.dropna(subset=[fecha_column, 'NODO_NORMALIZADO'], inplace=True)
        except Exception as e:
            raise ValueError(f"No se pudo leer el archivo de Cronograma: {e}")

        # 2. Consultar las dos vistas de la base de datos
        print("Servicio: Consultando datos de clientes y de IP...", file=sys.stderr)
        query_clientes = db_session.query(CacheCuboCarteras)
        df_clientes_db = pd.read_sql(query_clientes.statement, db_session.bind)

        query_ip = db_session.query(ClientesIp)
        df_ip_flags = pd.read_sql(query_ip.statement, db_session.bind)

        # 3. Unir la información de clientes con la bandera de IP
        # Usamos un LEFT JOIN para mantener a todos los clientes, incluso si no están en la lista de IP.
        df_clientes_completo = pd.merge(
            left=df_clientes_db,
            right=df_ip_flags,
            left_on='NRO_CUENTA',
            right_on='CLIENTENRO',
            how='left'
        )
        # Llenamos los valores NaN en 'BANDERA_IP' para clientes que no se encontraron, asumiendo que no tienen IP.
        df_clientes_completo['BANDERA_IP'].fillna('NO TIENE', inplace=True)

        # 4. Aplicar el nuevo filtro de IP Pública
        if ip_filter == 'with_ip':
            df_clientes_filtrados = df_clientes_completo[df_clientes_completo['BANDERA_IP'] == 'TIENE'].copy()
            print("Servicio: Aplicando filtro 'Con IP Pública'.", file=sys.stderr)
        elif ip_filter == 'without_ip':
            df_clientes_filtrados = df_clientes_completo[df_clientes_completo['BANDERA_IP'] != 'TIENE'].copy()
            print("Servicio: Aplicando filtro 'Sin IP Pública'.", file=sys.stderr)
        else:  # 'all'
            df_clientes_filtrados = df_clientes_completo.copy()
            print("Servicio: Mostrando todos los clientes (Con y Sin IP).", file=sys.stderr)

        # 5. Cruzar con el cronograma
        df_clientes_filtrados['NODO_NORMALIZADO'] = df_clientes_filtrados['NODO'].apply(self._normalize_nodo)
        df_merged = pd.merge(
            left=df_clientes_filtrados,
            right=df_cronograma,
            on='NODO_NORMALIZADO',
            how='inner'
        )

        if df_merged.empty:
            raise ValueError(
                "No se encontraron clientes que coincidan con los nodos del cronograma y el filtro de IP aplicado.")

        print(f"Servicio: ¡Éxito! Se encontraron {len(df_merged)} clientes afectados.", file=sys.stderr)
        return df_merged

    # Los métodos get_preview y export_to_excel ahora recibirán el nuevo parámetro ip_filter
    def get_preview(self, db_session: Session, cronograma_path: str, ip_filter: str, max_rows: int = 20) -> list:
        df_merged = self._get_processed_data(db_session, cronograma_path, ip_filter)
        final_columns = {
            'NRO_CUENTA': 'NRO_CUENTA', 'NOMBRE_CLIENTE': 'CLIENTE_NOMBRE_COMPLETO',
            'NODO': 'ZONA_GRUPO', 'EJECUTIVO_CORPORATE': 'EJECUTIVO_CORPORATE',
            'CORREO_TITULAR_PYME': 'CORREO_TITULAR_PYME', 'TELEFONO_CONTACTO': 'CLIENTE_TELEFONO',
            'FECHA TRABAJO': 'FECHA_TRABAJO'
        }
        existing_columns = [col for col in final_columns.keys() if col in df_merged.columns]
        df_final = df_merged[existing_columns].rename(columns=final_columns)
        return df_final.head(max_rows).to_dict(orient='records')

    def export_to_excel(self, db_session: Session, cronograma_path: str, ip_filter: str, output_path: str):
        df_processed = self._get_processed_data(db_session, cronograma_path, ip_filter)
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            grouped = df_processed.groupby(df_processed['FECHA TRABAJO'].dt.date)
            final_columns_export = {
                'NRO_CUENTA': 'NRO_CUENTA', 'NOMBRE_CLIENTE': 'CLIENTE_NOMBRE_COMPLETO',
                'NODO': 'ZONA_GRUPO', 'EJECUTIVO_CORPORATE': 'EJECUTIVO_CORPORATE',
                'CORREO_TITULAR_PYME': 'CORREO_TITULAR_PYME', 'TELEFONO_CONTACTO': 'CLIENTE_TELEFONO'
            }
            existing_columns = [col for col in final_columns_export.keys() if col in df_processed.columns]
            for date, group_df in grouped:
                sheet_name = date.strftime('%d-%m-%Y')
                df_to_export = group_df[existing_columns].rename(columns=final_columns_export)
                df_to_export.to_excel(writer, sheet_name=sheet_name, index=False)
        return {"status": "success", "path": output_path}
