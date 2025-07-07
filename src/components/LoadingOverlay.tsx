// src/components/LoadingOverlay.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  progress: number;
  message: string;
  onCancel: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, message, onCancel }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 w-full max-w-md">
          <h3 className="text-2xl font-bold text-white mb-4">Procesando...</h3>
          <p className="text-gray-300 mb-6 min-h-[2.5em]">{message || 'Por favor, espere.'}</p>

          <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
            <motion.div
              className="bg-blue-600 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-xl font-semibold text-white mb-8">{`${Math.round(progress)}%`}</p>

          <button
            onClick={onCancel}
            className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};