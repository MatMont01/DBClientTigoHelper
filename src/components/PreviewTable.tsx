import React from "react";
import { motion } from "framer-motion";

type PreviewTableProps = {
  data: Array<Record<string, any>>;
  maxRows?: number;
};

export const PreviewTable: React.FC<PreviewTableProps> = ({ data, maxRows = 10 }) => {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-blue-400 dark:text-blue-300 text-center py-6 text-lg font-medium"
      >
        No hay datos para mostrar.
      </motion.div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="overflow-x-auto rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800/40 mt-4
        bg-white/90 dark:bg-gray-900 transition-colors duration-300"
    >
      <table className="min-w-full text-base text-blue-950 dark:text-gray-100 transition-colors">
        <thead>
          <tr className="bg-gradient-to-r from-blue-200 via-blue-50 to-blue-100 dark:from-blue-900 dark:via-gray-900 dark:to-blue-950 transition-colors">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 font-extrabold text-blue-800 dark:text-blue-300 uppercase tracking-widest border-b border-blue-200 dark:border-blue-800 transition-colors"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, maxRows).map((row, i) => (
            <tr
              key={i}
              className={
                i % 2 === 0
                  ? "bg-white/80 dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
                  : "bg-blue-50/50 dark:bg-gray-800 hover:bg-blue-200/70 dark:hover:bg-blue-950/80 transition-colors"
              }
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-4 py-2 border-b border-blue-100 dark:border-blue-800/20 text-base font-medium transition-colors"
                >
                  {row[col] !== undefined && row[col] !== null ? String(row[col]) : ""}
                </td>
              ))}
            </tr>
          ))}
          {data.length > maxRows && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center italic py-2 text-blue-500 dark:text-blue-400"
              >
                ...mostrando solo las primeras {maxRows} filas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};
