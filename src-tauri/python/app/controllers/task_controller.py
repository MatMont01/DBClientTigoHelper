# src-tauri/python/app/controllers/task_controller.py
import sys
from ..services.clients_by_node_service import ClientsByNodeService
from ..models.database import SessionLocal


class TaskController:
    # 1. La firma del método ahora acepta el nuevo 'ip_filter'
    def execute_preview(self, cronograma_path: str, ip_filter: str):
        """
        Maneja la solicitud de vista previa, pasando la ruta del cronograma y el filtro de IP.
        """
        print("Controlador: Iniciando preview...", file=sys.stderr)
        db = SessionLocal()
        try:
            service = ClientsByNodeService()
            # 2. Pasa el nuevo argumento al servicio
            return service.get_preview(db, cronograma_path, ip_filter)
        finally:
            db.close()

    # 1. La firma del método ahora acepta el nuevo 'ip_filter'
    def execute_export(self, cronograma_path: str, ip_filter: str, output_path: str):
        """
        Maneja la solicitud de exportación, pasando todos los parámetros necesarios.
        """
        print(f"Controlador: Iniciando exportación a {output_path}", file=sys.stderr)
        db = SessionLocal()
        try:
            service = ClientsByNodeService()
            # 2. Pasa el nuevo argumento al servicio
            return service.export_to_excel(db, cronograma_path, ip_filter, output_path)
        finally:
            db.close()
