/**
 * providers/ThemeProvider.tsx
 */

import React from 'react';
import { ThemeContext } from '@theme/ThemeContext';
import { tokens } from '@theme/tokens';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={tokens}>
    {children}
  </ThemeContext.Provider>
);
