// src/hooks/useDarkMode.ts
import { useCallback, useEffect, useState } from "react";

export function useDarkMode(defaultValue = true) {
  const [isDark, setIsDark] = useState(() => {
    // Usa el valor guardado en localStorage, si existe
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    // Si no, respeta defaultValue
    return defaultValue;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark(d => !d), []);

  return { isDark, toggleDark };
}
