import { useState, useMemo } from "react";
import { Snowflake } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { getCategories } from "../../core/services/freezerService";
import { FreezerCategoryCard } from "./components/category/FreezerCategoryCard";
import { FreezerCategoryDetail } from "./components/category/FreezerCategoryDetail";
import { FreezerHeader } from "./components/category/FreezerHeader";
import { AddCategoryForm } from "./components/category/AddCategoryForm";
import { markScrolling } from "../../shared/utils/scrollGuard";

export const FreezerModule = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const liveCategories = useLiveQuery(() => getCategories(), []);
  const categories = useMemo(() => liveCategories ?? [], [liveCategories]);

  const activeCategory = categories.find(c => c.id === activeCategoryId) ?? null;

  if (activeCategory) {
    return <FreezerCategoryDetail category={activeCategory} onBack={() => setActiveCategoryId(null)} />;
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <FreezerHeader categoryCount={categories.length} />

      <div className="flex-1 min-h-0 overflow-y-auto" onScroll={markScrolling}>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 pb-16">
            <Snowflake className="w-12 h-12 text-slate-300" />
            <p className="text-sm font-medium text-center">Aucune catégorie pour l'instant</p>
            <p className="text-xs text-center">Crée ta première catégorie pour organiser ton congélateur</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {categories.map((category, i) => (
              <FreezerCategoryCard
                key={category.id}
                category={category}
                isFirst={i === 0}
                isLast={i === categories.length - 1}
                onClick={() => setActiveCategoryId(category.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pb-2">
        <AddCategoryForm />
      </div>
    </div>
  );
};
