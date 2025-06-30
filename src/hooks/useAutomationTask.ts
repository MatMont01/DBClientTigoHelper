// src/hooks/useAutomationTask.ts

import {useState, useCallback} from 'react';
// --- ¡ESTA ES LA LÍNEA CORREGIDA! ---
import {invoke} from '@tauri-apps/api/core';
// ------------------------------------
import type {AutomationTaskPreview, AutomationTaskParams} from '../types/TaskTypes';

type AutomationTaskStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Hook personalizado para ejecutar tareas de automatización del backend.
 * Gestiona el estado de la carga, los resultados y los errores.
 * @param taskName - El identificador de la tarea a ejecutar (ej: 'clientes_afectados_por_nodo').
 */
export function useAutomationTask(taskName: string) {
    const [status, setStatus] = useState<AutomationTaskStatus>('idle');
    const [result, setResult] = useState<AutomationTaskPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runTask = useCallback(async (params: AutomationTaskParams) => {
        setStatus('loading');
        setError(null);
        setResult(null);

        try {
            console.log(`[useAutomationTask] Ejecutando tarea: ${taskName}`, params);

            const res = await invoke<AutomationTaskPreview>('run_automation_task', {
                taskName: taskName,
                ...params
            });

            console.log('[useAutomationTask] Resultado recibido:', res);

            if (res === null || res === undefined) {
                throw new Error('La respuesta de la tarea fue nula o indefinida. Revisa la salida del backend.');
            }

            setResult(res);
            setStatus('success');
            return res;
        } catch (err) {
            console.error('[useAutomationTask] Error al ejecutar la tarea:', err);
            const errorMessage = typeof err === 'string' ? err : 'Ocurrió un error inesperado.';
            setError(errorMessage);
            setStatus('error');
            return null;
        }
    }, [taskName]);

    const reset = useCallback(() => {
        setStatus('idle');
        setResult(null);
        setError(null);
    }, []);

    return {status, result, error, runTask, reset};
}