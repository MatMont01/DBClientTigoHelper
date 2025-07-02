# src-tauri/python/app/controllers/task_controller.py
import sys
from ..services.clients_by_node_service import ClientsByNodeService
from ..models.database import SessionLocal

class TaskController:
    # La firma del método ahora solo necesita la ruta del cronograma
    def execute_preview(self, cronograma_path: str):
        """
        Maneja la solicitud de vista previa.
        """
        print("Controlador: Iniciando preview...", file=sys.stderr)
        db = SessionLocal()
        try:
            service = ClientsByNodeService()
            # La llamada al servicio ahora es más simple
            return service.get_preview(db, cronograma_path)
        finally:
            db.close()

    # La firma del método ahora solo necesita las rutas
    def execute_export(self, cronograma_path: str, output_path: str):
        """
        Maneja la solicitud de exportación a Excel.
        """
        print(f"Controlador: Iniciando exportación a {output_path}", file=sys.stderr)
        db = SessionLocal()
        try:
            service = ClientsByNodeService()
            # La llamada al servicio ahora es más simple
            return service.export_to_excel(db, cronograma_path, output_path)
        finally:
            db.close()