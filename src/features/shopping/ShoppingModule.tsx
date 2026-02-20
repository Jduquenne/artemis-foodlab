import { useState, useMemo } from 'react';
import { Printer, CheckCircle2, Circle } from 'lucide-react';
import { IngredientCategory } from '../../core/domain/types';

// src/features/shopping/ShoppingModule.tsx

export const ShoppingModule = () => {
    // Simulation de données consolidées (À remplacer par le hook de ton store plus tard)
    const [items, setItems] = useState([
        { name: 'Tomates', totalQuantity: 5, unit: 'pcs', category: IngredientCategory.VEGETABLE, checked: false },
        { name: 'Poulet', totalQuantity: 500, unit: 'g', category: IngredientCategory.MEAT, checked: false },
        { name: 'Pâtes', totalQuantity: 1, unit: 'kg', category: IngredientCategory.DRY, checked: true },
    ]);

    const toggleItem = (index: number) => {
        const newItems = [...items];
        newItems[index].checked = !newItems[index].checked;
        setItems(newItems);
    };

    // Groupement par catégories pour l'affichage
    const groupedItems = useMemo(() => {
        return Object.values(IngredientCategory).map(cat => ({
            category: cat,
            list: items.filter(i => i.category === cat)
        })).filter(group => group.list.length > 0);
    }, [items]);

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* HEADER ACTIONS */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Ma Liste</h1>
                    <p className="text-slate-500">{items.filter(i => !i.checked).length} articles restants</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                    <Printer className="w-5 h-5" /> Imprimer
                </button>
            </div>

            {/* GRILLE DES RAYONS (Scroll interne uniquement ici) */}
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedItems.map(group => (
                    <div key={group.category} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm self-start">
                        <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs mb-4">
                            {group.category}
                        </h2>
                        <div className="space-y-4">
                            {group.list.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => toggleItem(items.indexOf(item))}
                                    className={`flex items-center justify-between cursor-pointer group transition-opacity ${item.checked ? 'opacity-40' : 'opacity-100'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.checked ? <CheckCircle2 className="text-green-500 w-5 h-5" /> : <Circle className="text-slate-300 w-5 h-5" />}
                                        <span className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="text-slate-400 font-bold text-sm bg-slate-50 px-2 py-1 rounded-lg">
                                        {item.totalQuantity} {item.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};