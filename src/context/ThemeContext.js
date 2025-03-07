import React, { createContext, useState, useEffect } from 'react';

// Create the theme context
export const ThemeContext = createContext();

// Theme provider component
export const WorkoutThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'modern'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('workoutTheme');
    return savedTheme || 'modern';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('workoutTheme', theme);
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'vintage' ? 'modern' : 'vintage');
  };
  
  // Set a specific theme
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'vintage' || newTheme === 'modern') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useWorkoutTheme = () => React.useContext(ThemeContext);