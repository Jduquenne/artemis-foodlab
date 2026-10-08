import { useEffect, useState, ReactNode } from 'react';
import { ThemeContext, Theme, readStoredTheme } from './themeContextValue';
import { applyThemeColor } from '../utils/themeColor';
import { readStorage, writeStorage } from '../utils/safeStorage';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => readStoredTheme(readStorage('theme')));

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        applyThemeColor(theme);
        writeStorage('theme', theme);
    }, [theme]);

    const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
};
