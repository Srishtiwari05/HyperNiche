import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'hyperniche_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always open in bright theme by default when opening the site.
  // Users can switch to dark anytime; during the active session, their choice is respected.
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const sessionPref = sessionStorage.getItem(THEME_STORAGE_KEY);
      if (sessionPref === 'dark' || sessionPref === 'light') {
        return sessionPref;
      }
    } catch {
      // ignore
    }
    return 'light'; // Always bright theme enabled on open!
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
