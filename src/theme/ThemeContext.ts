/**
 * theme/ThemeContext.ts
 * Provides the design tokens to all components via context.
 * Prepared for future dark mode: swap `tokens` for a dark variant.
 */

import { createContext, useContext } from 'react';
import { tokens, Tokens } from './tokens';

export const ThemeContext = createContext<Tokens>(tokens);

/**
 * useTheme()
 * Returns the full design token object.
 * Destructure only what you need:
 *   const { colors, spacing, radius } = useTheme();
 */
export function useTheme(): Tokens {
  return useContext(ThemeContext);
}
