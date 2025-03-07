import React from 'react';
import { SunMoon, Palette } from 'lucide-react';
import { useWorkoutTheme } from '../../context/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useWorkoutTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className={`theme-switcher ${theme}`}
      aria-label={`Switch to ${theme === 'vintage' ? 'modern' : 'vintage'} theme`}
      title={`Switch to ${theme === 'vintage' ? 'Modern' : 'Vintage'} Theme`}
    >
      {theme === 'vintage' ? (
        <SunMoon size={18} />
      ) : (
        <Palette size={18} />
      )}
    </button>
  );
};

export default ThemeSwitcher;