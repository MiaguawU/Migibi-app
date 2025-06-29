
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({
  colorPrimary: '#00b96b',
  borderRadius: 10,
  colorBorder: "#3E7E1E",
  colorBgContainer: '#E1EBCD',
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const theme = {
    colorPrimary: '#00b96b',
    borderRadius: 10,
    colorBorder: "#3E7E1E",
    colorBgContainer: '#E1EBCD',
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};