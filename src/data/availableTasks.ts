// src/data/availableTasks.ts
import type { AutomationTaskList } from "../types/TaskTypes";
import nodeIcon from "../assets/Tigo_Milicom.jpg";

export const AVAILABLE_TASKS: AutomationTaskList = [
  {
    key: "clients_by_node",
    displayName: "Clientes afectados por nodo",
    description: "Identifica y exporta los clientes afectados por trabajos programados en nodos según cronograma.",
    image: nodeIcon,
  },
  // Agrega futuras tareas aquí...
];
