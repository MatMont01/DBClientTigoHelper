# src-tauri/python/main.py

import sys
import os

# --- INICIO DEL BLOQUE DE COMPATIBILIDAD PARA PYINSTALLER ---
# Este código asegura que el script encuentre la carpeta 'app'
# tanto en el IDE como cuando está empaquetado en un .exe.
if getattr(sys, 'frozen', False):
    # Si se ejecuta como un .exe (empaquetado)
    application_path = os.path.dirname(sys.executable)
else:
    # Si se ejecuta como un script normal (.py)
    application_path = os.path.dirname(os.path.abspath(__file__))

# Añadimos la ruta principal a los paths de Python
sys.path.insert(0, application_path)
# --- FIN DEL BLOQUE DE COMPATIBILIDAD ---


# Ahora las importaciones relativas funcionarán sin problemas
import json
import argparse
from app.controllers.task_controller import TaskController


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", required=True, choices=['preview', 'export'])
    parser.add_argument("--output-path", help="Ruta de salida para el modo export.")
    args = parser.parse_args()

    controller = TaskController()
    try:
        if args.mode == 'preview':
            result = controller.execute_preview()
        elif args.mode == 'export':
            if not args.output_path:
                raise ValueError("Se necesita --output-path para el modo export.")
            result = controller.execute_export(args.output_path)

        print(json.dumps(result, ensure_ascii=False, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
