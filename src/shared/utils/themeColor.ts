import type { Theme } from "../hooks/useTheme";

const THEME_COLORS: Record<Theme, string> = {
  light: "#f97316",
  dark: "#1a1510",
};

export function applyThemeColor(theme: Theme): void {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}
