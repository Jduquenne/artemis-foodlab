import { ReactNode } from "react";

export interface SettingsSectionProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

export const SettingsSection = ({ title, hint, children }: SettingsSectionProps) => (
  <section className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-slate-500">{title}</span>
    {children}
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </section>
);
