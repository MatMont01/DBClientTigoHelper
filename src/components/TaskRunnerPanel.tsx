// src/components/TaskRunnerPanel.tsx

import React, {useState} from 'react';
import {invoke} from '@tauri-apps/api/core';
import {save} from '@tauri-apps/plugin-dialog';
import {motion, AnimatePresence} from 'framer-motion';
import {PreviewTable} from './PreviewTable';
import type {AutomationTask} from '../types/TaskTypes'; // Importamos el tipo

// 1. INTERFAZ CORREGIDA: Añadimos la propiedad 'onBack'.
interface TaskRunnerPanelProps {
    task: AutomationTask;
    onBack: () => void; // onBack es una función que no devuelve nada.
}

type Status = 'idle' | 'loading' | 'preview' | 'success' | 'error';

export const TaskRunnerPanel: React.FC<TaskRunnerPanelProps> = ({task, onBack}) => {
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);

    const handleReset = () => {
        setStatus('idle');
        setError(null);
        setPreviewData([]);
    };

    const handlePreview = async () => {
        setStatus('loading');
        setError(null);
        try {
            // Usamos el 'key' de la tarea para el comando de preview
            const resultJson = await invoke<string>('preview_task', {taskName: task.key});
            const data = JSON.parse(resultJson);
            if (data.error) throw new Error(data.error);

            setPreviewData(data);
            setStatus('preview');
        } catch (e: any) {
            setError(e.message || e.toString());
            setStatus('error');
        }
    };

    const handleExport = async () => {
        const defaultPath = `Reporte_${task.key}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        const outputPath = await save({defaultPath, filters: [{name: 'Excel', extensions: ['xlsx']}]});

        if (outputPath) {
            setStatus('loading');
            setError(null);
            try {
                // Usamos el 'key' de la tarea y el outputPath para el comando de exportación
                const resultJson = await invoke<string>('export_task', {taskName: task.key, outputPath});
                const data = JSON.parse(resultJson);
                if (data.error) throw new Error(data.error);

                setStatus('success');
            } catch (e: any) {
                setError(e.message || e.toString());
                setStatus('error');
            }
        }
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto my-8 p-6 rounded-3xl shadow-2xl bg-blue-50 dark:bg-[#181e2a] border border-blue-300 dark:border-blue-900/60"
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            {/* 2. BOTÓN "VOLVER" CORREGIDO: Ahora usa la función onBack que recibe como prop. */}
            <button onClick={onBack} className="text-blue-500 dark:text-blue-400 hover:underline mb-4">
                &larr; Volver a Tareas
            </button>
            <h2 className="font-extrabold text-2xl text-blue-800 dark:text-blue-300 mb-2 tracking-tight">{task.displayName}</h2>
            <p className="mb-5 text-blue-900/80 dark:text-gray-400 font-medium">{task.description}</p>

            {/* El resto del componente se mantiene igual, pero he revisado las llamadas a 'invoke' para asegurar que pasen el task.key */}
            <div className="flex justify-center space-x-4">
                <button onClick={handlePreview} disabled={status === 'loading'}
                        className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {status === 'loading' ? 'Cargando...' : 'Previsualizar'}
                </button>
                <button onClick={handleExport} disabled={status === 'loading'}
                        className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Generar Reporte
                </button>
                {(status !== 'idle' && status !== 'loading') && (
                    <button onClick={handleReset}
                            className="px-6 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600">
                        Limpiar
                    </button>
                )}
            </div>

            <AnimatePresence>
                {status === 'error' && (
                    <motion.div className="mt-6 p-4 text-red-800 bg-red-100 border border-red-300 rounded-lg"
                                initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                        <strong>Error:</strong> {error}
                    </motion.div>
                )}
                {status === 'success' && (
                    <motion.div className="mt-6 p-4 text-green-800 bg-green-100 border border-green-300 rounded-lg"
                                initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                        ¡Éxito! El reporte ha sido generado correctamente.
                    </motion.div>
                )}
                {status === 'preview' && previewData.length > 0 && (
                    <motion.div className="mt-8" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
                        <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 mb-3">Vista Previa</h3>
                        <PreviewTable data={previewData}/>
                    </motion.div>
                )}
                {status === 'preview' && previewData.length === 0 && (
                    <motion.div className="mt-6 p-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg"
                                initial={{opacity: 0}} animate={{opacity: 1}}>
                        La consulta no devolvió resultados con los filtros aplicados.
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};