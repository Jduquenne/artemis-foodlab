import { BaseVersion, BaseVersionChoice } from '../../../core/domain/baseVersion';
import { Food } from '../../../core/domain/ingredient';
import { RecipeDetails } from '../../../core/domain/recipe';
import { findBaseVersion, industrialEquivalentLabel } from '../../../core/logic/baseVersion/baseVersionLogic';

export interface BaseVersionSectionProps {
    bases: readonly RecipeDetails[];
    choices: readonly BaseVersionChoice[];
    frozenLabels: Record<string, string>;
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

const hintClass = (selected: boolean) => `text-[11px] ${selected ? 'text-orange-100' : 'text-slate-400'}`;

interface VersionOption {
    version: BaseVersion;
    title: string;
    hint: string;
}

function optionsFor(base: RecipeDetails, frozenLabel: string | undefined, foods: Record<string, Food>): VersionOption[] {
    const equivalent = base.industrialEquivalent;
    return [
        { version: 'home', title: 'Maison', hint: 'Recette de la base' },
        ...(equivalent ? [{ version: 'industrial' as const, title: 'Du commerce', hint: industrialEquivalentLabel(equivalent, foods) }] : []),
        ...(frozenLabel ? [{ version: 'frozen' as const, title: 'Du congélateur', hint: `${frozenLabel} pris au lot` }] : []),
    ];
}

export const BaseVersionSection = ({ bases, choices, frozenLabels, foods, disabled, onChange }: BaseVersionSectionProps) => (
    <>
        {bases.map((base) => {
            const current = findBaseVersion(choices, base.code) ?? 'home';
            const options = optionsFor(base, frozenLabels[base.code], foods);
            const leavesFrozen = Boolean(frozenLabels[base.code]) && current !== 'frozen';
            return (
                <section key={base.code} className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-slate-500">
                        {base.name}
                        <span className="font-normal text-slate-400"> · version de la base</span>
                    </p>
                    <div role="radiogroup" aria-label={`Version de ${base.name}`} className={`grid gap-2 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        {options.map((option) => {
                            const selected = current === option.version;
                            return (
                                <button
                                    key={option.version}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    disabled={disabled}
                                    onClick={() => onChange(base.code, option.version)}
                                    className={optionClass(selected)}
                                >
                                    <span className="text-sm font-bold">{option.title}</span>
                                    <span className={hintClass(selected)}>{option.hint}</span>
                                </button>
                            );
                        })}
                    </div>
                    {leavesFrozen && (
                        <p className="text-[11px] text-slate-400">À l'enregistrement, la quantité retourne au congélateur (sauf pour un repas passé).</p>
                    )}
                </section>
            );
        })}
    </>
);
