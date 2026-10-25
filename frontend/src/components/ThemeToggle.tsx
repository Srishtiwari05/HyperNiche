import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Bright / Dark mode"
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors shadow-2xs cursor-pointer"
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-3.5 h-3.5 text-[var(--text-primary)]" />
          <span>Dark mode</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-[var(--text-primary)]" />
          <span>Bright mode</span>
        </>
      )}
    </button>
  );
};

