export interface ProgressViewProps {
    label: string;
    pct: number;
    detail?: string;
}

export const ProgressView = ({ label, pct, detail }: ProgressViewProps) => (
    <div className="flex flex-col gap-2">
        <p className="text-slate-600 text-sm font-medium">{label}</p>
        <div className="w-full bg-slate-200 dark:bg-slate-300 rounded-full h-2 overflow-hidden">
            <div className="w-full bg-orange-500 h-2 rounded-full transition-transform duration-200 origin-left" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        {detail && <p className="text-slate-400 text-xs">{detail}</p>}
    </div>
);
