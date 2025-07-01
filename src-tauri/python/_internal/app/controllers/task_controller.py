# src-tauri/python/app/controllers/task_controller.py
import sys  # <-- AÑADIR ESTA LÍNEA
from ..services.clients_by_node_service import ClientsByNodeService
from ..models.database import SessionLocal


class TaskController:
    def execute_preview(self):
        print("Controlador: Iniciando preview...", file=sys.stderr)  # <-- CAMBIO AQUÍ
        db = SessionLocal()
        try:
            service = ClientsByNodeService()
            return service.get_preview(db)
        finally:
            db.close()

    def execute_export(self, output_path: str):
        print(f"Controlador: Iniciando exportación a {output_path}", file=sys.stderr)  # <-- CAMBIO AQUÍ
        db = SessionLocal()
        try:
            service = ClientsByNodeService()
            return service.export_to_excel(db, output_path)
        finally:
            db.close()
