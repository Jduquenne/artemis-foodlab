import { useEffect, useState, ReactNode } from 'react';
import { ThemeContext, Theme, readStoredTheme } from './themeContextValue';
import { applyThemeColor } from '../utils/themeColor';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => readStoredTheme(localStorage.getItem('theme')));

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        applyThemeColor(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
};
