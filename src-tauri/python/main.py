# src-tauri/python/main.py
import sys
import os
import json
import argparse

# Bloque de compatibilidad para PyInstaller (se mantiene igual)
if getattr(sys, 'frozen', False):
    application_path = os.path.dirname(sys.executable)
    sys.path.insert(0, application_path)
    internal_path = os.path.join(application_path, '_internal')
    if os.path.isdir(internal_path):
        sys.path.insert(0, internal_path)
else:
    application_path = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, application_path)

from app.controllers.task_controller import TaskController


def main():
    parser = argparse.ArgumentParser(description="Ejecutor de tareas de automatización.")

    parser.add_argument("--mode", required=True, choices=['preview', 'export'])
    parser.add_argument("--cronograma-path", required=True, help="Ruta al archivo Excel del cronograma.")
    parser.add_argument("--output-path", help="Ruta de salida para el reporte en modo export.")

    # El argumento --b2b-filter ha sido eliminado

    args = parser.parse_args()
    controller = TaskController()

    try:
        if args.mode == 'preview':
            # Llamada al controlador simplificada
            result = controller.execute_preview(cronograma_path=args.cronograma_path)
        elif args.mode == 'export':
            if not args.output_path:
                raise ValueError("El modo 'export' requiere el argumento --output-path.")
            # Llamada al controlador simplificada
            result = controller.execute_export(
                cronograma_path=args.cronograma_path,
                output_path=args.output_path
            )

        print(json.dumps(result, ensure_ascii=False, default=str))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()