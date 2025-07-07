import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return 'system';
    
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Determine if dark mode should be active
    let shouldBeDark = false;
    
    if (theme === 'dark') {
      shouldBeDark = true;
    } else if (theme === 'light') {
      shouldBeDark = false;
    } else if (theme === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDarkMode(shouldBeDark);
    
    // Apply to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes when using system mode
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeMode = (newTheme) => {
    setTheme(newTheme);
  };

  // Keep toggleTheme for backward compatibility
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 