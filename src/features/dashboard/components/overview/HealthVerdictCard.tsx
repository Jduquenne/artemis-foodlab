export interface HealthVerdictCardProps {
  issueCount: number;
  flaggedItems: number;
  recipes: number;
  foods: number;
}

export const HealthVerdictCard = ({ issueCount, flaggedItems, recipes, foods }: HealthVerdictCardProps) => {
  const clear = issueCount === 0;

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 p-5 flex flex-col justify-between">
      <div className="flex flex-col">
        <span
          className={`text-6xl lg:text-7xl font-black leading-none tabular-nums ${
            clear ? "text-emerald-500" : "text-amber-500"
          }`}
        >
          {clear ? "0" : issueCount}
        </span>
        <span className="mt-2 text-lg font-black text-slate-800">
          {clear ? "Catalogue en ordre" : issueCount === 1 ? "point à vérifier" : "points à vérifier"}
        </span>
        {!clear && (
          <span className="mt-1 text-sm text-slate-500">
            {flaggedItems} {flaggedItems === 1 ? "entrée concernée" : "entrées concernées"}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400">
        Analyse de {recipes} recettes et {foods} aliments
      </p>
    </div>
  );
};
