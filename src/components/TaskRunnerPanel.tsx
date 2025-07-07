// src/components/TaskRunnerPanel.tsx
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { PreviewTable } from './PreviewTable';
import type { AutomationTask } from '../types/TaskTypes';

interface TaskRunnerPanelProps {
  task: AutomationTask;
  onBack: () => void;
}

type Status = 'idle' | 'loading' | 'preview' | 'success' | 'error';
type IpFilter = 'with_ip' | 'without_ip' | 'all';

export const TaskRunnerPanel: React.FC<TaskRunnerPanelProps> = ({ task, onBack }) => {
  const [cronogramaPath, setCronogramaPath] = useState<string | null>(null);
  const [ipFilter, setIpFilter] = useState<IpFilter>('with_ip');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileSelect = async () => {
    const selectedPath = await open({
      title: 'Selecciona el Cronograma',
      multiple: false,
      filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
    });
    if (typeof selectedPath === 'string') {
      setCronogramaPath(selectedPath);
      handleReset();
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setPreviewData([]);
  };

  const handlePreview = async () => {
    if (!cronogramaPath) return;
    setStatus('loading');
    setError(null);
    try {
      // --- CAMBIO CLAVE: Usamos los nombres en camelCase que el frontend ya estaba usando ---
      const resultJson = await invoke<string>('preview_task', {
        cronogramaPath: cronogramaPath,
        ipFilter: ipFilter,
      });
      const data = JSON.parse(resultJson);
      if (data.error) throw new Error(data.error);

      setPreviewData(data);
      setStatus("preview");
    } catch (e: any) {
      setError(e.message || e.toString());
      setStatus("error");
    }
  };

  const handleExport = async () => {
    if (!cronogramaPath) return;
    const defaultPath = `Reporte_${task.key}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    const outputPath = await save({ defaultPath, filters: [{ name: 'Excel', extensions: ['xlsx'] }] });

    if (outputPath) {
      setStatus('loading');
      setError(null);
      try {
        // --- CAMBIO CLAVE: Usamos los nombres en camelCase ---
        const resultJson = await invoke<string>('export_task', {
          cronogramaPath: cronogramaPath,
          ipFilter: ipFilter,
          outputPath: outputPath,
        });
        const data = JSON.parse(resultJson);
        if (data.error) throw new Error(data.error);
        setStatus("success");
      } catch (e: any) {
        setError(e.message || e.toString());
        setStatus("error");
      }
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto my-8 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:underline mb-4">&larr; Volver</button>
      <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{task.displayName}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{task.description}</p>
      <div className="space-y-6 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">1. Cargar Archivo de Cronograma</label>
          <button onClick={handleFileSelect} className="w-full text-left p-3 bg-white dark:bg-gray-900 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500">
            {cronogramaPath ? (
              <span className="text-green-600 dark:text-green-400 truncate">✓ Archivo: {cronogramaPath.split('\\').pop() || cronogramaPath.split('/').pop()}</span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Haz clic para seleccionar un archivo .xlsx</span>
            )}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">2. Filtrar por IP Pública</label>
          <div className="mt-2 flex space-x-4 rounded-lg bg-gray-200 dark:bg-gray-900 p-1">
            {(['with_ip', 'without_ip', 'all'] as IpFilter[]).map((filter) => (
              <button key={filter} onClick={() => setIpFilter(filter)} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${ipFilter === filter ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-700'}`}>
                {filter === 'with_ip' ? 'Con IP' : filter === 'without_ip' ? 'Sin IP' : 'Ambos'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <button onClick={handlePreview} disabled={!cronogramaPath || status === 'loading'} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {status === 'loading' ? 'Cargando...' : 'Previsualizar'}
        </button>
        <button onClick={handleExport} disabled={!cronogramaPath || status === 'loading'} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Generar Reporte
        </button>
        {(status !== 'idle' && status !== 'loading') && (
            <button onClick={handleReset} className="px-6 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600">
                Limpiar
            </button>
        )}
      </div>
      <AnimatePresence>
        {status === 'error' && <motion.div className="mt-6 p-4 text-red-800 bg-red-100 border border-red-300 rounded-lg"><strong>Error:</strong> {error}</motion.div>}
        {status === 'success' && <motion.div className="mt-6 p-4 text-green-800 bg-green-100 border border-green-300 rounded-lg">¡Éxito! El reporte ha sido generado.</motion.div>}
        {status === 'preview' && previewData.length > 0 && (
          <motion.div className="mt-8">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">Vista Previa</h3>
            <PreviewTable data={previewData} />
          </motion.div>
        )}
        {status === 'preview' && previewData.length === 0 && (
          <motion.div className="mt-6 p-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg">
            La consulta no devolvió resultados con los filtros aplicados.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};