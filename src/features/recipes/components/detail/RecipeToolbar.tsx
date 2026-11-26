import { Calculator, ChefHat, ChevronRight, Flame, Minus, Pencil, Plus, Users } from 'lucide-react';
import { RecipeCost } from '../../../../core/logic/price/recipeCostLogic';
import { RecipeCostInfo } from './RecipeCostInfo';

export interface RecipeToolbarProps {
  portions: number;
  onPortionsChange: (value: number) => void;
  cost: RecipeCost | null;
  onOpenCost: () => void;
  onOpenCooking?: () => void;
  onEdit?: () => void;
  onOpenMacros: () => void;
  onStartCooking: () => void;
}

const STEP_BUTTON = 'grid place-items-center w-9 h-9 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-muted active:bg-strong transition-colors disabled:opacity-30 disabled:pointer-events-none';
const ACTION_BUTTON = 'flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-w-11 min-h-11 sm:min-h-0 px-3 text-xs font-bold text-slate-500 hover:text-orange-600 hover:bg-muted active:bg-strong transition-colors';

export const RecipeToolbar = ({ portions, onPortionsChange, cost, onOpenCost, onOpenCooking, onEdit, onOpenMacros, onStartCooking }: RecipeToolbarProps) => (
  <div className="flex flex-col sm:flex-row items-stretch w-full sm:w-auto rounded-2xl bg-surface shadow-sm overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-muted">
    <div className="flex items-stretch divide-x divide-muted">
      <div className="flex items-center gap-1 px-1.5 py-1.5" role="group" aria-label="Nombre de parts">
        <button
          type="button"
          aria-label="Réduire le nombre de parts"
          onClick={() => onPortionsChange(Math.max(1, portions - 1))}
          disabled={portions <= 1}
          className={STEP_BUTTON}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center justify-center w-10 leading-none">
          <span className="flex items-center gap-1 text-base font-black text-slate-800 tabular-nums">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {portions}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">part{portions > 1 ? 's' : ''}</span>
        </div>
        <button
          type="button"
          aria-label="Augmenter le nombre de parts"
          onClick={() => onPortionsChange(portions + 1)}
          className={STEP_BUTTON}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {cost && (
        <button
          type="button"
          onClick={onOpenCost}
          aria-label="Voir le détail du prix"
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 hover:bg-muted active:bg-strong transition-colors"
        >
          <RecipeCostInfo cost={cost} portions={portions} />
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      )}
    </div>

    <div className="flex items-stretch divide-x divide-muted">
      <button type="button" aria-label="Mode cuisine" title="Mode cuisine" onClick={onStartCooking} className={`${ACTION_BUTTON} text-orange-600`}>
        <ChefHat className="w-4 h-4" />
        <span className="sm:hidden md:inline">Cuisiner</span>
      </button>
      {onOpenCooking && (
        <button type="button" aria-label="Cuisson des ingrédients" title="Cuisson des ingrédients" onClick={onOpenCooking} className={ACTION_BUTTON}>
          <Flame className="w-4 h-4" />
          <span className="sm:hidden md:inline">Cuisson</span>
        </button>
      )}
      {onEdit && (
        <button type="button" aria-label="Modifier dans le créateur" title="Modifier dans le créateur" onClick={onEdit} className={ACTION_BUTTON}>
          <Pencil className="w-4 h-4" />
          <span className="sm:hidden md:inline">Modifier</span>
        </button>
      )}
      <button type="button" aria-label="Calculateur nutritionnel" title="Calculateur nutritionnel" onClick={onOpenMacros} className={ACTION_BUTTON}>
        <Calculator className="w-4 h-4" />
        <span className="sm:hidden md:inline">Macros</span>
      </button>
    </div>
  </div>
);
