import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavZoneProps {
    direction: 'prev' | 'next';
    visible: boolean;
    isActive: boolean;
}

export const WeekNavZone = ({ direction, visible, isActive }: WeekNavZoneProps) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isActive) return;
        const start = performance.now();
        const DURATION = 950;
        let raf: number;
        const tick = () => {
            const p = Math.min((performance.now() - start) / DURATION, 1);
            setProgress(p);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            setProgress(0);
        };
    }, [isActive]);

    if (!visible) return null;

    const isPrev = direction === 'prev';

    return (
        <div className={[
            'fixed top-0 bottom-0 z-40 flex flex-col items-center justify-center gap-2 overflow-hidden pointer-events-none transition-colors duration-200',
            isPrev ? 'left-0' : 'right-0',
            'w-[72px]',
            isActive
                ? 'bg-orange-500/15 dark:bg-orange-500/20'
                : 'bg-black/[0.06] dark:bg-black/20',
        ].join(' ')}>
            <div className={[
                'flex flex-col items-center gap-2 transition-all duration-200',
                isActive ? 'scale-110 text-orange-500' : 'text-slate-400 dark:text-slate-500',
            ].join(' ')}>
                {isPrev
                    ? <ChevronLeft size={30} strokeWidth={2.5} />
                    : <ChevronRight size={30} strokeWidth={2.5} />
                }
                <span className="text-[8.5px] font-black uppercase tracking-widest text-center leading-tight px-1">
                    {isPrev ? <>Sem.<br />préc.</> : <>Sem.<br />suiv.</>}
                </span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200/60 dark:bg-slate-700/60">
                <div
                    className="h-full w-full bg-orange-500 origin-left"
                    style={{ transform: `scaleX(${progress})` }}
                />
            </div>
        </div>
    );
};
