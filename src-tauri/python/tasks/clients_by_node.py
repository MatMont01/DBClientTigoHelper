import pandas as pd
from typing import Optional, List, Literal
from core.excel_utils import ExcelUtils
from core.file_utils import FileUtils


class ClientsByNodeTask:
    def __init__(self):
        self.schedule_df: Optional[pd.DataFrame] = None
        self.clients_df: Optional[pd.DataFrame] = None
        self.result_df: Optional[pd.DataFrame] = None

    def load_schedule(self, file_path: str):
        required_columns = [
            "NODO_N", "FECHA TRABAJO", "DEPARTAMENTO"
        ]
        FileUtils.validate_extension(file_path)
        self.schedule_df = ExcelUtils.load_excel(file_path, required_columns)

    def load_clients(self, file_path: str):
        required_columns = [
            "CLIENTENRO", "CLIENTE_NOMBRE_COMPLETO", "ZONA_GRUPO",
            "DEPARTAMENTO", "PRODUCTO_IP", "ES_B2B", "CLIENTE_TELEFONO"
        ]
        FileUtils.validate_extension(file_path)
        self.clients_df = ExcelUtils.load_excel(file_path, required_columns)

    def process(self, filter_b2b: Literal["all", "b2b", "b2c"] = "all"):
        """
        filter_b2b:
            - "all": muestra todos
            - "b2b": solo clientes B2B (ES_B2B == 1 o 'SI')
            - "b2c": solo clientes B2C (ES_B2B == 0 o 'NO')
        """
        if self.schedule_df is None or self.clients_df is None:
            raise ValueError("Both schedule and clients data must be loaded first.")

        schedule = self.schedule_df.copy()
        clients = self.clients_df.copy()

        schedule["NODO_N"] = schedule["NODO_N"].astype(str).str.strip().str.upper()
        schedule["DEPARTAMENTO"] = schedule["DEPARTAMENTO"].astype(str).str.strip().str.upper()
        schedule["FECHA TRABAJO"] = pd.to_datetime(schedule["FECHA TRABAJO"], errors='coerce')
        schedule = schedule[schedule["FECHA TRABAJO"].notnull()]

        # Extraer código de nodo
        clients["NODO_EXTRAIDO"] = clients["ZONA_GRUPO"].astype(str).str.extract(
            r'(SCZ\d+|LPZ\d+|SRE\d+|EAL\d+|PTS\d+|CBB\d+|TRJ\d+)', expand=False).str.upper()
        clients["DEPARTAMENTO"] = clients["DEPARTAMENTO"].astype(str).str.strip().str.upper()

        # Normaliza columna ES_B2B a valores string
        clients["ES_B2B"] = clients["ES_B2B"].astype(str).str.strip().str.upper()

        # Filtrar según el parámetro filter_b2b
        if filter_b2b == "b2b":
            clients = clients[clients["ES_B2B"].isin(["1", "SI", "TRUE", "YES"])]
        elif filter_b2b == "b2c":
            clients = clients[clients["ES_B2B"].isin(["0", "NO", "FALSE", ""])]
            # Ajusta según tus datos reales

        # Merge usando nodo extraído y departamento
        merged = pd.merge(
            clients,
            schedule,
            left_on=["NODO_EXTRAIDO", "DEPARTAMENTO"],
            right_on=["NODO_N", "DEPARTAMENTO"],
            how="inner",
            suffixes=('_CLIENTE', '_TRABAJO')
        )

        # Selección de columnas finales
        result = merged[[
            "FECHA TRABAJO",
            "NODO_N",
            "DEPARTAMENTO",
            "CLIENTENRO",
            "CLIENTE_NOMBRE_COMPLETO",
            "PRODUCTO_IP",
            "CLIENTE_TELEFONO",
            "ES_B2B"
        ]].sort_values(by=["FECHA TRABAJO", "NODO_N", "CLIENTENRO"])

        self.result_df = result.reset_index(drop=True)

    def get_preview(self, max_rows: int = 10) -> pd.DataFrame:
        if self.result_df is None:
            raise ValueError("No result available. Did you run process()?")
        return ExcelUtils.preview_dataframe(self.result_df, max_rows)

    def export_result(self, output_path: str) -> str:
        if self.result_df is None:
            raise ValueError("No result to export. Did you run process()?")

        FileUtils.validate_extension(output_path)

        df = self.result_df.copy()
        df["FECHA_STR"] = df["FECHA TRABAJO"].dt.strftime("%d-%m-%Y")
        df["MES_ANIO"] = df["FECHA TRABAJO"].dt.strftime("%B %Y")

        with pd.ExcelWriter(output_path) as writer:
            for mes, group in df.groupby("MES_ANIO"):
                sheet_name = mes[:31]
                group.drop(columns=["FECHA_STR", "MES_ANIO"], inplace=True)
                group.to_excel(writer, sheet_name=sheet_name, index=False)
        return output_path  # Debe ser la ruta absoluta, NO los datos

    def get_result_columns(self) -> List[str]:
        if self.result_df is None:
            return []
        return list(self.result_df.columns)
