import {useState, useCallback} from 'react';
import type {AutomationTaskPreview, AutomationTaskParams} from '../types/TaskTypes';
import {runAutomationTask} from '../utils/tauriHelpers';

type AutomationTaskStatus = "idle" | "loading" | "success" | "error";

export function useAutomationTask(taskKey: string) {
    const [status, setStatus] = useState<AutomationTaskStatus>("idle");
    const [result, setResult] = useState<AutomationTaskPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runTask = useCallback(async (params: AutomationTaskParams) => {
        setStatus("loading");
        setError(null);
        setResult(null);
        try {
            console.log("[useAutomationTask] Ejecutando tarea:", taskKey, params);
            const res = await runAutomationTask(taskKey, params);
            console.log("[useAutomationTask] Resultado:", res);

            if (res === null || res === undefined) {
                throw new Error("La respuesta de la tarea fue vacía o undefined. Verifica el backend.");
            }

            setResult(res);
            setStatus("success");
            return res;
        } catch (err: any) {
            console.error("[useAutomationTask] Error:", err);
            setError(err?.message || JSON.stringify(err) || "Unknown error");
            setStatus("error");
            return null;
        }
    }, [taskKey]);

    const reset = () => {
        setStatus("idle");
        setResult(null);
        setError(null);
    };

    return {status, result, error, runTask, reset};
}
