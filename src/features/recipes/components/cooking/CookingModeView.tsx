import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { RecipeDetails } from '../../../../core/domain/recipe';
import { cookingGroups, instructionSteps } from '../../../../core/logic/recipe/cookingModeLogic';
import { useRecipesSnapshot } from '../../../../shared/hooks/useCatalogueSnapshot';
import { useModalDismiss } from '../../../../shared/hooks/useModalDismiss';
import { useWakeLock } from '../../../../shared/hooks/useWakeLock';
import { toggleInList } from '../../../../core/utils/collectionUtils';

export interface CookingModeViewProps {
    recipe: RecipeDetails;
    portions: number;
    instructionsPhotoUrl: string | undefined;
    onClose: () => void;
}

export const CookingModeView = ({ recipe, portions, instructionsPhotoUrl, onClose }: CookingModeViewProps) => {
    const recipes = useRecipesSnapshot();
    const groups = useMemo(() => cookingGroups(recipe, portions, recipes), [recipe, portions, recipes]);
    const steps = instructionSteps(recipe.instructions);
    const [done, setDone] = useState<string[]>([]);
    const toggle = (key: string) => setDone((list) => toggleInList(list, key));
    useWakeLock(true);
    useModalDismiss(onClose);

    return (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col" role="dialog" aria-modal="true" aria-label={`Mode cuisine — ${recipe.name}`}>
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-surface border-b border-slate-200">
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{recipe.name}</h1>
                    <p className="text-sm font-bold text-orange-600">Mode cuisine · {portions} portion{portions > 1 ? 's' : ''}</p>
                </div>
                <button type="button" aria-label="Quitter le mode cuisine" onClick={onClose} className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-muted transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 p-4">
                <section className="md:overflow-y-auto flex flex-col gap-4 pb-4">
                    {groups.map((group) => (
                        <div key={group.key} className="flex flex-col gap-1">
                            {group.title && <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">{group.title}</h2>}
                            {group.lines.map((line) => {
                                const checked = done.includes(line.key);
                                return (
                                    <button
                                        key={line.key}
                                        type="button"
                                        onClick={() => toggle(line.key)}
                                        aria-pressed={checked}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-surface text-left transition-opacity ${checked ? 'opacity-40' : ''}`}
                                    >
                                        {checked ? <CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0" /> : <Circle className="w-6 h-6 text-slate-300 shrink-0" />}
                                        <span className={`flex-1 min-w-0 text-lg font-semibold text-slate-800 ${checked ? 'line-through' : ''}`}>
                                            {line.name}
                                            {line.preparation && <span className="text-sm font-medium text-slate-400"> · {line.preparation}</span>}
                                        </span>
                                        {line.quantityLabel && <span className="shrink-0 text-lg font-black text-slate-900 tabular-nums">{line.quantityLabel}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </section>

                <section className="md:overflow-y-auto flex flex-col gap-2 pb-4">
                    {steps.length > 0 ? steps.map((step, index) => {
                        const key = `step-${index}`;
                        const checked = done.includes(key);
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggle(key)}
                                aria-pressed={checked}
                                className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-surface text-left transition-opacity ${checked ? 'opacity-40' : ''}`}
                            >
                                <span className="shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white grid place-items-center text-sm font-black">{index + 1}</span>
                                <span className={`text-lg leading-snug text-slate-800 ${checked ? 'line-through' : ''}`}>{step}</span>
                            </button>
                        );
                    }) : instructionsPhotoUrl ? (
                        <img src={instructionsPhotoUrl} alt={`Instructions — ${recipe.name}`} className="w-full h-auto rounded-2xl shadow-sm" />
                    ) : (
                        <p className="text-center text-slate-400 italic mt-6">Pas d'instructions pour cette recette.</p>
                    )}
                </section>
            </div>
        </div>
    );
};
