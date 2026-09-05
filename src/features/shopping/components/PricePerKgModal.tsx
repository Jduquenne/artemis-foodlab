import { useState, useEffect } from 'react';
import { X, RotateCcw, Scale } from 'lucide-react';
import { computePricePerKg } from '../../../core/logic/shopping/shoppingLogic';

export interface PricePerKgModalProps {
    onClose: () => void;
}

const STORAGE_KEY = 'cipe_shopping_price_calc';

const formatPricePerKg = (value: number): string =>
    `${value.toFixed(2).replace('.', ',')} €/kg`;

const loadStoredCalc = (): { weight: string; price: string } => {
    try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
        return { weight: s?.weight ?? '', price: s?.price ?? '' };
    } catch {
        return { weight: '', price: '' };
    }
};

export const PricePerKgModal = ({ onClose }: PricePerKgModalProps) => {
    const [weight, setWeight] = useState(() => loadStoredCalc().weight);
    const [price, setPrice] = useState(() => loadStoredCalc().price);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ weight, price }));
    }, [weight, price]);

    const weightNum = parseFloat(weight.replace(',', '.'));
    const priceNum = parseFloat(price.replace(',', '.'));
    const result = computePricePerKg(weightNum, priceNum);

    const handleReset = () => {
        setWeight('');
        setPrice('');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-200 rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" />
                        Prix au kilo
                    </p>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="px-5 pb-5 space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Poids (g)</label>
                        <input
                            type="number"
                            inputMode="decimal"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="500"
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-100 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Prix (€)</label>
                        <input
                            type="number"
                            inputMode="decimal"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="2,50"
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-100 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                    </div>
                    <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 px-3 py-3 text-center">
                        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Prix au kilo</p>
                        <p className="text-lg font-black text-orange-600 mt-0.5">
                            {result !== null ? formatPricePerKg(result) : '—'}
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:text-orange-600 hover:border-orange-300 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Réinitialiser
                    </button>
                </div>
            </div>
        </div>
    );
};
