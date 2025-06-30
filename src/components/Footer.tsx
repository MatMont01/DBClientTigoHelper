import React from "react";

export const Footer: React.FC = () => (
  <footer className="text-center py-6 mt-10 text-sm border-t transition-colors duration-300
    bg-white/80 dark:bg-transparent
    border-blue-200/40 dark:border-blue-900/30
    text-blue-800/80 dark:text-blue-300/80
    backdrop-blur-sm select-none">
    <span className="font-semibold tracking-wide">
      © 2025 ExcelClientTigoHelper
    </span>
    <span className="block text-xs mt-1
      text-blue-400/80 dark:text-blue-100/50
      ">
      Powered by <span className="font-bold text-blue-600 dark:text-blue-400">React</span>, <span className="font-bold text-blue-600 dark:text-blue-400">Tauri</span> &amp; <span className="font-bold text-blue-600 dark:text-blue-400">Python</span>
    </span>
  </footer>
);
