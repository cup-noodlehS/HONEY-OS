import type { FC, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isDarkMode: boolean;

  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;

      localStorage.setItem("honey-os-dark-mode", String(newMode));

      return newMode;
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("honey-os-dark-mode");

    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === "true");
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

