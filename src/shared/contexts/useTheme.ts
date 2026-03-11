import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
    theme: Theme;
    toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);
