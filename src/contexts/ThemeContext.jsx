import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

// Create the ThemeContext
const ThemeContext = createContext();

// ThemeProvider component to wrap the app
export const ThemeProvider = ({ children }) => {
  const location = useLocation();

  // Define themes
  const themes = {
    default: {
      name: 'default',
      primaryBg: '#003087', // Deep navy blue from Header.css
      accentColor: '#0052cc',
      accentHover: '#003c8f',
      lightBg: '#e6f0fa',
    },
    about: {
      name: 'about',
      primaryBg: 'linear-gradient(90deg, #6B46C1, #9F7AEA)', // Purple gradient for About page
      accentColor: '#7C3AED',
      accentHover: '#5B21B6',
      lightBg: '#E9D5FF',
    },
  };

  // Determine the theme based on the current route
  const theme = location.pathname === '/about' ? themes.about : themes.default;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to access the theme
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};