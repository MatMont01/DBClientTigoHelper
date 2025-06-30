import {invoke} from '@tauri-apps/api/core';
import type {AutomationTaskPreview, AutomationTaskParams} from '../types/TaskTypes';

/**
 * Llama una tarea de automatización al backend Python a través de Tauri.
 * @param taskKey Nombre de la tarea (ej: 'clients_by_node')
 * @param params  Parámetros requeridos por la tarea (se pasan como JSON)
 * @returns      Preview del resultado (array de objetos), o lanza error
 */
export async function runAutomationTask(
    taskKey: string,
    params: AutomationTaskParams
): Promise<AutomationTaskPreview> {
    try {
        const result = await invoke<string>('run_automation_task', {
            taskName: taskKey,
            paramsJson: JSON.stringify(params)
        });
        return JSON.parse(result);
    } catch (error) {
        console.error("Error calling automation task:", error);
        throw error;
    }
}

/**
 * Exporta un Excel usando el backend y obtiene el nombre del archivo generado.
 */
export async function exportAutomationTask(
    taskKey: string,
    params: AutomationTaskParams
): Promise<string> {
    try {
        // El backend ahora devuelve un string plano, SIN comillas
        const filename = await invoke<string>('run_automation_task', {
            taskName: taskKey,
            paramsJson: JSON.stringify({...params, mode: 'export'})
        });

        if (!filename) {
            throw new Error("No se recibió el nombre del archivo exportado.");
        }

        // Asegúrate de limpiar posibles saltos de línea o comillas accidentales
        return filename.trim().replace(/^"|"$/g, "");
    } catch (error) {
        console.error("Error exporting automation task:", error);
        throw error;
    }
}
