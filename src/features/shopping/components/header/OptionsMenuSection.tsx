import { ReactNode } from 'react';

export interface OptionsMenuSectionProps {
    title: string;
    children: ReactNode;
}

export const OptionsMenuSection = ({ title, children }: OptionsMenuSectionProps) => (
    <div className="py-1.5 border-t border-slate-200 first:border-t-0">
        <p className="px-2.5 pt-1 pb-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{title}</p>
        {children}
    </div>
);
