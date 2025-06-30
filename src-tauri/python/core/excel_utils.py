import pandas as pd
from typing import List, Optional
import os


class ExcelUtils:
    @staticmethod
    def load_excel(file_path: str, required_columns: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Carga un archivo Excel y valida que contenga las columnas requeridas.
        Devuelve un DataFrame de pandas.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            raise ValueError(f"Could not read Excel file: {e}")

        if required_columns:
            missing = [col for col in required_columns if col not in df.columns]
            if missing:
                raise ValueError(f"Missing columns in '{file_path}': {', '.join(missing)}")
        return df

    @staticmethod
    def save_to_excel(df: pd.DataFrame, file_path: str, index: bool = False) -> None:
        """
        Guarda un DataFrame en un archivo Excel.
        """
        try:
            df.to_excel(file_path, index=index)
        except Exception as e:
            raise ValueError(f"Could not save to Excel: {e}")

    @staticmethod
    def preview_dataframe(df: pd.DataFrame, max_rows: int = 10) -> pd.DataFrame:
        """
        Devuelve un DataFrame truncado a max_rows para mostrar como preview.
        """
        return df.head(max_rows)

    @staticmethod
    def list_excel_columns(file_path: str) -> List[str]:
        """
        Lista las columnas de un archivo Excel.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        try:
            df = pd.read_excel(file_path, nrows=0)
        except Exception as e:
            raise ValueError(f"Could not read Excel file: {e}")
        return list(df.columns)
