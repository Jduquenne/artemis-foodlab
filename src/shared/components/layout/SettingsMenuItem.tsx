import { ReactNode } from "react";

export interface SettingsMenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  divided?: boolean;
}

export const SettingsMenuItem = ({ icon, label, onClick, divided = true }: SettingsMenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors ${divided ? "border-t border-slate-100" : ""}`}
  >
    {icon}
    {label}
  </button>
);
