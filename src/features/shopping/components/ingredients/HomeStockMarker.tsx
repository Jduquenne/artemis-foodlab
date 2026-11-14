import { Check } from 'lucide-react';
import { HomeStockState } from '../../../../core/logic/shopping/shoppingRowLabel';

export interface HomeStockMarkerProps {
    state: HomeStockState;
}

export const HomeStockMarker = ({ state }: HomeStockMarkerProps) => {
    if (state === 'full') {
        return (
            <span className="grid place-items-center w-5 h-5 rounded-md bg-green-500 text-white shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={3.5} />
            </span>
        );
    }
    if (state === 'partial') return <span className="w-5 h-5 rounded-md border-2 border-green-500 bg-green-50 dark:bg-green-900/20 shrink-0" />;
    return <span className="w-5 h-5 rounded-md border-2 border-dashed border-slate-300 shrink-0" />;
};
