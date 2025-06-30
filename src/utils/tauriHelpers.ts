// src/utils/tauriHelpers.ts

// --- ¡IMPORTACIÓN CORREGIDA SEGÚN LA DOCUMENTACIÓN! ---
import {save} from '@tauri-apps/plugin-dialog';
import {invoke} from '@tauri-apps/api/core';
import type {AutomationTaskParams, AutomationTaskPreview} from '../types/TaskTypes';

/**
 * Abre el diálogo nativo del sistema para guardar un archivo.
 * @param defaultPath - Una ruta y nombre de archivo sugerido.
 * @returns Una promesa que se resuelve con la ruta seleccionada o null si el usuario cancela.
 */
export async function openSaveDialog(defaultPath?: string): Promise<string | null> {
    // --- USAMOS LA FUNCIÓN 'save' DIRECTAMENTE ---
    const result = await save({
        title: 'Guardar Reporte Como',
        defaultPath,
        filters: [{
            name: 'Excel Files',
            extensions: ['xlsx']
        }]
    });

    // La lógica de abajo se mantiene igual, ya es correcta.
    if (Array.isArray(result) || result === null) {
        return null;
    }
    return result;
}

/**
 * Invoca el comando del backend de Tauri para ejecutar una tarea de automatización.
 * @param taskName - El identificador de la tarea.
 * @param params - Los parámetros para la tarea, incluyendo la ruta de salida.
 * @returns Una promesa que se resuelve con el resultado de la tarea.
 */
export async function runAutomationTask(taskName: string, params: AutomationTaskParams): Promise<AutomationTaskPreview> {
    return await invoke('run_automation_task', {
        taskName,
        ...params
    });
}