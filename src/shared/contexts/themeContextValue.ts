import { createContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({ theme: "light", toggle: () => {} });

export function readStoredTheme(value: string | null): Theme {
  return value === "dark" ? "dark" : "light";
}
