import { BaseVersion, BaseVersionChoice } from '../../../core/domain/baseVersion';
import { Food } from '../../../core/domain/ingredient';
import { RecipeDetails } from '../../../core/domain/recipe';
import { findBaseVersion, industrialEquivalentLabel } from '../../../core/logic/baseVersion/baseVersionLogic';

export interface BaseVersionSectionProps {
    bases: readonly RecipeDetails[];
    choices: readonly BaseVersionChoice[];
    foods: Record<string, Food>;
    disabled: boolean;
    onChange: (baseCode: string, version: BaseVersion) => void;
}

const optionClass = (selected: boolean) =>
    `flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl border text-left transition-colors disabled:opacity-50 ${
        selected
            ? 'bg-orange-500 border-orange-400 text-white shadow-sm'
            : 'bg-surface border-slate-200 text-slate-600 hover:bg-muted'
    }`;

export const BaseVersionSection = ({ bases, choices, foods, disabled, onChange }: BaseVersionSectionProps) => (
    <>
        {bases.map((base) => {
            const industrial = findBaseVersion(choices, base.code) === 'industrial';
            const equivalent = base.industrialEquivalent;
            return (
                <section key={base.code} className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-slate-500">
                        {base.name}
                        <span className="font-normal text-slate-400"> · version de la base</span>
                    </p>
                    <div role="radiogroup" aria-label={`Version de ${base.name}`} className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            role="radio"
                            aria-checked={!industrial}
                            disabled={disabled}
                            onClick={() => onChange(base.code, 'home')}
                            className={optionClass(!industrial)}
                        >
                            <span className="text-sm font-bold">Maison</span>
                            <span className={`text-[11px] ${!industrial ? 'text-orange-100' : 'text-slate-400'}`}>Recette de la base</span>
                        </button>
                        <button
                            type="button"
                            role="radio"
                            aria-checked={industrial}
                            disabled={disabled}
                            onClick={() => onChange(base.code, 'industrial')}
                            className={optionClass(industrial)}
                        >
                            <span className="text-sm font-bold">Du commerce</span>
                            <span className={`text-[11px] ${industrial ? 'text-orange-100' : 'text-slate-400'}`}>
                                {equivalent ? industrialEquivalentLabel(equivalent, foods) : ''}
                            </span>
                        </button>
                    </div>
                </section>
            );
        })}
    </>
);
