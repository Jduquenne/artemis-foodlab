import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export const SettingsCard = ({ icon: Icon, title, description, action, children }: SettingsCardProps) => (
  <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-surface p-3.5">
    <header className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20">
        <Icon size={15} />
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {description && <p className="text-[11px] leading-snug text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
    {children && <div className="flex flex-col gap-3">{children}</div>}
  </section>
);
