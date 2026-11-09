import { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}

export const FormField = ({ label, error, hint, children }: FormFieldProps) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-bold text-slate-500">{label}</span>
    {children}
    {error && <span className="text-xs text-red-500">{error}</span>}
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </label>
);
