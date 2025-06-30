// src/data/availableTasks.ts

// Solo importamos el tipo que necesitamos
import type {AutomationTask} from "../types/TaskTypes";

// Definimos explícitamente que la lista es un array de AutomationTask
export const AVAILABLE_TASKS: AutomationTask[] = [
    {
        key: "clientes_afectados_por_nodo",
        displayName: "Clientes Afectados por Nodo",
        description: "Identifica y exporta los clientes con IP Pública afectados por trabajos programados en nodos, según el cronograma."
    },
    // Aquí puedes añadir más tareas en el futuro
];