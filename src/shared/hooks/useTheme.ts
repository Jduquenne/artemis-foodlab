import { useContext } from "react";
import { ThemeContext } from "../contexts/themeContextValue";

export const useTheme = () => useContext(ThemeContext);
