import { ReactNode } from 'react';
import { ShoppingCart } from 'lucide-react';

export interface ShoppingEmptyStateProps {
    title: string;
    hint: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export const ShoppingEmptyState = ({ title, hint, icon, action }: ShoppingEmptyStateProps) => (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 text-center px-4">
        {icon ?? <ShoppingCart className="w-12 h-12 opacity-30" />}
        <div>
            <p className="font-medium text-slate-500">{title}</p>
            <p className="text-sm mt-1">{hint}</p>
        </div>
        {action}
    </div>
);
