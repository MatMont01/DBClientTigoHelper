import os
import shutil
import tempfile
from typing import Optional


class FileUtils:
    SUPPORTED_EXTENSIONS = ['.xlsx', '.xls']

    @staticmethod
    def file_exists(file_path: str) -> bool:
        """
        Verifica si el archivo existe en la ruta dada.
        """
        return os.path.isfile(file_path)

    @staticmethod
    def validate_extension(file_path: str) -> None:
        """
        Valida que el archivo tenga una extensión de Excel permitida.
        """
        _, ext = os.path.splitext(file_path)
        if ext.lower() not in FileUtils.SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file extension: {ext}")

    @staticmethod
    def get_filename(file_path: str) -> str:
        """
        Obtiene solo el nombre del archivo desde una ruta.
        """
        return os.path.basename(file_path)

    @staticmethod
    def get_temp_file_path(suffix: str = ".xlsx") -> str:
        """
        Genera una ruta temporal segura para guardar un archivo temporal.
        """
        temp_dir = tempfile.gettempdir()
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=temp_dir)
        temp_file.close()  # Cerramos para permitir que otros procesos lo usen.
        return temp_file.name

    @staticmethod
    def get_temp_file_path_by_name(file_name: str) -> str:
        """
        Devuelve la ruta absoluta de un archivo en la carpeta temporal del sistema.
        """
        import tempfile
        import os
        return os.path.join(tempfile.gettempdir(), file_name)

    @staticmethod
    def delete_file(file_path: str) -> None:
        """
        Elimina un archivo, si existe.
        """
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                raise OSError(f"Error deleting file {file_path}: {e}")

    @staticmethod
    def copy_file(src: str, dst: str) -> None:
        """
        Copia un archivo de src a dst.
        """
        try:
            shutil.copy2(src, dst)
        except Exception as e:
            raise OSError(f"Error copying file from {src} to {dst}: {e}")
