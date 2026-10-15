import { useRef, useState } from 'react';
import { Loader2, LucideIcon, MoreHorizontal } from 'lucide-react';
import { FloatingMenu } from '../../../../shared/components/ui/FloatingMenu';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

export interface ItemAction {
    id: string;
    label: string;
    icon: LucideIcon;
    onSelect: () => void;
    danger?: boolean;
}

export interface ItemActionsMenuProps {
    actions: ItemAction[];
    pending?: boolean;
    compact?: boolean;
    hoverScope?: 'slot' | 'cell';
    className: string;
}

const HOVER_REVEAL = {
    slot: 'opacity-0 group-hover:opacity-100',
    cell: 'opacity-0 group-hover/cell:opacity-100',
};

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

export const ItemActionsMenu = ({ actions, pending, compact, hoverScope = 'slot', className }: ItemActionsMenuProps) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    if (actions.length === 0) return null;

    const visibility = IS_TOUCH || pending || open ? 'opacity-100' : HOVER_REVEAL[hoverScope];
    const size = compact ? 'p-0.5 rounded' : 'p-1.5 rounded-lg';
    const iconSize = compact ? 10 : 14;

    return (
        <span className={`absolute z-20 ${className}`} onClick={stop} onPointerDown={stop}>
            <button
                ref={buttonRef}
                aria-label="Actions"
                disabled={pending}
                onClick={() => setOpen((o) => !o)}
                className={`${size} bg-surface-raised/90 text-slate-600 border border-slate-200 shadow-md hover:bg-subtle transition-opacity disabled:opacity-60 ${visibility}`}
            >
                {pending
                    ? <Loader2 size={iconSize} className="animate-spin" />
                    : <MoreHorizontal size={iconSize} />}
            </button>
            <FloatingMenu open={open} anchorRef={buttonRef} onClose={() => setOpen(false)}>
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => { setOpen(false); action.onSelect(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${action.danger
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                            : 'text-slate-700 hover:bg-subtle'}`}
                    >
                        <action.icon className="w-4 h-4 shrink-0" />
                        {action.label}
                    </button>
                ))}
            </FloatingMenu>
        </span>
    );
};
