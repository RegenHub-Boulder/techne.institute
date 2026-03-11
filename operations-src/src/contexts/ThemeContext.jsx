import { createContext, useContext, useState, useEffect } from "react";
import { getTheme } from "../lib/themes";

const ThemeContext = createContext(getTheme("dark"));

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem("rh-theme") || "dark"; }
    catch { return "dark"; }
  });

  const toggleTheme = () => {
    setMode(m => {
      const next = m === "dark" ? "light" : "dark";
      try { localStorage.setItem("rh-theme", next); } catch {}
      return next;
    });
  };

  // Keep body background in sync so there's no flash on unrendered areas
  useEffect(() => {
    const theme = getTheme(mode);
    document.body.style.backgroundColor = theme.palette.bg;
    document.body.style.color = theme.palette.text;
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ ...getTheme(mode), toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
