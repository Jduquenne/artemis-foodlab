import { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export const FormField = ({ label, hint, children }: FormFieldProps) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-bold text-slate-500">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </label>
);
