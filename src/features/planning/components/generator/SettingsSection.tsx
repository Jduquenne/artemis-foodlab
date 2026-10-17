import { ReactNode } from "react";

export interface SettingsSectionProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

export const SettingsSection = ({ title, hint, children }: SettingsSectionProps) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</span>
    {children}
    {hint && <span className="text-[11px] leading-snug text-slate-400">{hint}</span>}
  </div>
);
