import React from "react";
import { Moon, Sun, Search, User } from "lucide-react";
import tigoLogo from "../assets/tigoLogo.png";
import { useDarkMode } from "../hooks/useDarkMode"; // <-- Importa el hook

type NavbarProps = {
  searchValue: string;
  onSearchChange: (v: string) => void;
};

export const Navbar: React.FC<NavbarProps> = ({ searchValue, onSearchChange }) => {
  const { isDark, toggleDark } = useDarkMode();

  return (
    <nav className="w-full sticky top-0 z-30 bg-white text-gray-800 dark:bg-[#161D32] dark:text-blue-200 transition-colors duration-300 flex items-center px-4 sm:px-8 py-2 gap-3">
      {/* LOGO */}
      <div className="flex items-center gap-2">
        <img src={tigoLogo} alt="Tigo" className="h-8 w-8 rounded-lg" />
        <span className="text-xl font-bold tracking-wide text-blue-700 dark:text-blue-300 select-none hidden sm:inline">
          ExcelClientTigoHelper
        </span>
      </div>
      {/* SEARCH */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            type="search"
            className="w-full py-2 pl-10 pr-4 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition dark:bg-[#11172A] dark:text-blue-100 dark:border-blue-800/40"
            placeholder="Buscar tareas…"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 dark:text-blue-400/70 pointer-events-none" />
        </div>
      </div>
      {/* RESTO */}
      <div className="flex items-center gap-4 ml-2">
        <button
          onClick={toggleDark}
          title="Alternar modo claro/oscuro"
          className="p-2 rounded-full bg-blue-900/10 hover:bg-blue-700/20 transition"
        >
          {isDark ? (
            <Moon className="h-5 w-5 text-blue-300" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
        </button>
        <div className="bg-blue-800/50 text-blue-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow ring-2 ring-blue-600 select-none">
          <User className="h-5 w-5" />
        </div>
      </div>
    </nav>
  );
};
