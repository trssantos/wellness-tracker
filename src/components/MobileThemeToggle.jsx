import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const MobileThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 sm:hidden">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full shadow-lg transition-colors 
          dark:bg-slate-700/90 dark:hover:bg-slate-600 dark:text-white
          bg-white hover:bg-slate-200 text-slate-700 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon size={18} />
        ) : (
          <Sun size={18} />
        )}
      </button>
    </div>
  );
};

export default MobileThemeToggle;