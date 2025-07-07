# src-tauri/python/main.py
import sys
import os
import json
import argparse

# Bloque de compatibilidad para PyInstaller (se mantiene igual)
if getattr(sys, 'frozen', False):
    application_path = os.path.dirname(sys.executable)
    internal_path = os.path.join(application_path, '_internal')
    if os.path.isdir(internal_path):
        sys.path.insert(0, internal_path)
    sys.path.insert(0, application_path)
else:
    application_path = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, application_path)

from app.controllers.task_controller import TaskController


def main():
    # 1. Configuración del analizador de argumentos actualizada
    parser = argparse.ArgumentParser(description="Ejecutor de tareas de automatización.")

    parser.add_argument("--mode", required=True, choices=['preview', 'export'], help="Modo de ejecución de la tarea.")
    parser.add_argument("--cronograma-path", required=True, help="Ruta al archivo Excel del cronograma.")

    # --- AÑADIMOS EL NUEVO ARGUMENTO PARA EL FILTRO DE IP ---
    parser.add_argument("--ip-filter", required=True, choices=['with_ip', 'without_ip', 'all'],
                        help="Filtro de tipo de IP.")

    parser.add_argument("--output-path", help="Ruta de salida para guardar el reporte en modo export.")

    args = parser.parse_args()

    controller = TaskController()
    try:
        # 2. Lógica actualizada para llamar al controlador con el nuevo filtro
        if args.mode == 'preview':
            result = controller.execute_preview(
                cronograma_path=args.cronograma_path,
                ip_filter=args.ip_filter
            )
        elif args.mode == 'export':
            if not args.output_path:
                raise ValueError("El modo 'export' requiere el argumento --output-path.")
            result = controller.execute_export(
                cronograma_path=args.cronograma_path,
                ip_filter=args.ip_filter,
                output_path=args.output_path
            )

        # 3. Imprimimos el resultado final como JSON
        print(json.dumps(result, ensure_ascii=False, default=str))

    except Exception as e:
        # En caso de cualquier error, lo imprimimos como un JSON de error
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
