import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// "light" | "dark" | "system"
function getInitialPreference() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light" || stored === "system")
    return stored;
  return "system"; // default to system
}

function resolveTheme(preference) {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(getInitialPreference);
  const [resolved, setResolved] = useState(() =>
    resolveTheme(getInitialPreference()),
  );

  // Apply dark class on <html> whenever resolved theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolved]);

  // Persist preference & resolve
  useEffect(() => {
    localStorage.setItem("theme", preference);
    setResolved(resolveTheme(preference));
  }, [preference]);

  // Listen for OS theme changes (only matters when preference is "system")
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (preference === "system") {
        setResolved(mq.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setTheme = (value) => {
    setPreference(value); // "light" | "dark" | "system"
  };

  return (
    <ThemeContext.Provider
      value={{
        preference, // "light" | "dark" | "system"
        darkMode: resolved === "dark",
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
