# src-tauri/python/app/services/clients_by_node_service.py
import sys
import pandas as pd
from sqlalchemy.orm import Session
from ..models.clients_by_node_model import CacheCuboCarteras
import re


class ClientsByNodeService:
    def _normalize_nodo(self, nodo_text: str) -> str:
        """
        Función de limpieza final y robusta.
        1. Se asegura de que sea un string.
        2. Elimina la palabra "NODO" y cualquier caracter no alfanumérico al principio.
        3. Convierte a mayúsculas y quita espacios en blanco.
        """
        if not isinstance(nodo_text, str):
            return ''
        # Elimina prefijos como "NODO " y deja solo el identificador
        cleaned_text = re.sub(r'^[A-Z\s_]*', '', nodo_text.upper().strip())
        return cleaned_text

    def _get_processed_data(self, db_session: Session, cronograma_excel_path: str) -> pd.DataFrame:
        print("--- MODO DEPURACIÓN FINAL ---", file=sys.stderr)

        # 1. Leer y normalizar el cronograma
        try:
            df_cronograma = pd.read_excel(cronograma_excel_path, sheet_name=0)
            df_cronograma.dropna(subset=['NODO_N', 'FECHA TRABAJO'], inplace=True)
            df_cronograma['NODO_NORMALIZADO'] = df_cronograma['NODO_N'].apply(self._normalize_nodo)
            df_cronograma['FECHA TRABAJO'] = pd.to_datetime(df_cronograma['FECHA TRABAJO'], errors='coerce')
            df_cronograma.dropna(subset=['FECHA TRABAJO', 'NODO_NORMALIZADO'], inplace=True)

            nodos_excel = set(df_cronograma['NODO_NORMALIZADO'].unique())
            print(f"\n--- [DEBUG] Nodos únicos y normalizados del EXCEL ({len(nodos_excel)}): ---", file=sys.stderr)
            print(sorted(list(nodos_excel)), file=sys.stderr)

        except Exception as e:
            raise ValueError(f"Error al leer el cronograma: {e}")

        # 2. Consultar y procesar clientes de la BD
        query = db_session.query(CacheCuboCarteras)
        df_clientes_db = pd.read_sql(query.statement, db_session.bind)
        df_clientes_db.dropna(subset=['NODO'], inplace=True)
        df_clientes_db['NODO_NORMALIZADO'] = df_clientes_db['NODO'].apply(self._normalize_nodo)

        nodos_db = set(df_clientes_db['NODO_NORMALIZADO'].unique())
        print(f"\n--- [DEBUG] Nodos únicos y normalizados de la BASE DE DATOS ({len(nodos_db)}): ---", file=sys.stderr)
        print(sorted(list(nodos_db)), file=sys.stderr)

        # 3. --- ¡DIAGNÓSTICO FINAL! ---
        #    Calculamos y mostramos la intersección entre las dos listas de nodos.
        nodos_en_comun = sorted(list(nodos_excel.intersection(nodos_db)))
        print(f"\n--- [DIAGNÓSTICO] INTERSECCIÓN DE NODOS ENCONTRADA ({len(nodos_en_comun)}): ---", file=sys.stderr)
        print(nodos_en_comun, file=sys.stderr)
        print("\n--------------------------------------------------\n", file=sys.stderr)

        # 4. Cruzar datos
        df_merged = pd.merge(left=df_clientes_db, right=df_cronograma, on='NODO_NORMALIZADO', how='inner')

        if df_merged.empty:
            raise ValueError("No se encontraron clientes que coincidan. Revisa las listas de nodos en la consola.")

        return df_merged

    # El resto de los métodos (get_preview, export_to_excel) se mantienen igual,
    # ya que dependen de la lógica de _get_processed_data que hemos mejorado.
    def get_preview(self, db_session: Session, cronograma_path: str, max_rows: int = 20) -> list:
        df_merged = self._get_processed_data(db_session, cronograma_path)
        final_columns = {
            'NRO_CUENTA': 'NRO_CUENTA', 'NOMBRE_CLIENTE': 'CLIENTE_NOMBRE_COMPLETO',
            'NODO': 'ZONA_GRUPO', 'EJECUTIVO_CORPORATE': 'EJECUTIVO_CORPORATE',
            'CORREO_TITULAR_PYME': 'CORREO_TITULAR_PYME', 'TELEFONO_CONTACTO': 'CLIENTE_TELEFONO',
            'FECHA TRABAJO': 'FECHA_TRABAJO'
        }
        existing_columns = [col for col in final_columns.keys() if col in df_merged.columns]
        df_final = df_merged[existing_columns].rename(columns=final_columns)
        return df_final.head(max_rows).to_dict(orient='records')

    def export_to_excel(self, db_session: Session, cronograma_path: str, output_path: str):
        df_processed = self._get_processed_data(db_session, cronograma_path)
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