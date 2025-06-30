import sys
import json
import pandas as pd
import os
import tempfile

from core.file_utils import FileUtils
from tasks.clients_by_node import ClientsByNodeTask

TASKS = {
    "clients_by_node": ClientsByNodeTask,
}


def main():
    if len(sys.argv) < 3:
        print("Faltan argumentos", file=sys.stderr)
        sys.exit(1)

    task_name = sys.argv[1]
    params_json = sys.argv[2]

    try:
        params = json.loads(params_json)
    except Exception as e:
        print(json.dumps({"error": f"Error al parsear params: {e}"}), file=sys.stderr)
        sys.exit(1)

    # Verifica si es modo exportación
    mode = params.get("mode", "preview")
    filter_b2b = params.get("filter_b2b", "all")
    schedule_path = params.get("schedule_path")
    clients_path = params.get("clients_path")

    if not schedule_path or not clients_path:
        print(json.dumps({"error": "Faltan archivos schedule_path o clients_path"}), file=sys.stderr)
        sys.exit(1)

    # Lógica principal de la tarea
    try:
        TaskClass = TASKS.get(task_name)
        if TaskClass is None:
            raise ValueError(f"Tarea desconocida: {task_name}")

        task = TaskClass()
        task.load_schedule(FileUtils.get_temp_file_path_by_name(schedule_path))
        task.load_clients(FileUtils.get_temp_file_path_by_name(clients_path))
        task.process(filter_b2b=filter_b2b)

        if mode == "export":
            # Genera nombre de archivo único y lo guarda en temp
            temp_dir = tempfile.gettempdir()
            filename = f"{task_name}_resultado_{int(pd.Timestamp.now().timestamp())}.xlsx"
            output_path = os.path.join(temp_dir, filename)
            task.export_result(output_path)
            print(filename)
            return
        else:
            preview = task.get_preview(20)
            # Convierte las columnas datetime a string
            for col in preview.columns:
                if pd.api.types.is_datetime64_any_dtype(preview[col]):
                    preview[col] = preview[col].astype(str)
            print(json.dumps(preview.where(pd.notnull(preview), None).to_dict(orient="records"), ensure_ascii=False))
            return

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
