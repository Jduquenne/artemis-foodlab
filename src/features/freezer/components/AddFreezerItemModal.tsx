import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { Unit, RecipeDetails, FoodFreezerItem, BatchFreezerItem } from "../../../core/domain/types";
import { addItemToCategory } from "../../../core/services/freezerService";
import { FoodSearchInput } from "./FoodSearchInput";
import recipesDb from "../../../core/data/recipes-db.json";

const FOOD_UNITS: { value: Unit; label: string }[] = [
  { value: Unit.G, label: "g" },
  { value: Unit.KG, label: "kg" },
  { value: Unit.ML, label: "ml" },
  { value: Unit.CL, label: "cl" },
  { value: Unit.L, label: "l" },
  { value: Unit.PORTION, label: "portion(s)" },
  { value: Unit.PACKET, label: "sachet(s)" },
  { value: Unit.SLICE, label: "tranche(s)" },
  { value: Unit.NONE, label: "unité(s)" },
];

interface AddFreezerItemModalProps {
  categoryId: string;
  onClose: () => void;
}

export const AddFreezerItemModal = ({ categoryId, onClose }: AddFreezerItemModalProps) => {
  const [tab, setTab] = useState<"food" | "batch">("food");
  const [saving, setSaving] = useState(false);

  const [foodName, setFoodName] = useState("");
  const [foodId, setFoodId] = useState<string | undefined>(undefined);
  const [foodQty, setFoodQty] = useState("");
  const [foodUnit, setFoodUnit] = useState<Unit>(Unit.G);
  const [foodPreparation, setFoodPreparation] = useState("");

  const [recipeSearch, setRecipeSearch] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [portions, setPortions] = useState(1);

  const recipes = useMemo(() => {
    const data = recipesDb as unknown as Record<string, RecipeDetails>;
    const q = recipeSearch.toLowerCase().trim();
    return Object.entries(data)
      .filter(([, r]) => r.assets?.photo && (!q || r.name.toLowerCase().includes(q)))
      .sort(([, a], [, b]) => {
        if (a.batchCooking && !b.batchCooking) return -1;
        if (!a.batchCooking && b.batchCooking) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 30)
      .map(([id, r]) => ({ id, name: r.name, isBatch: r.batchCooking ?? false }));
  }, [recipeSearch]);

  const selectedRecipe = useMemo(
    () => recipes.find(r => r.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId]
  );

  const canSave =
    tab === "food" ? foodName.trim().length > 0 && foodQty.trim().length > 0
                   : selectedRecipeId !== null && portions > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    if (tab === "food") {
      const item: Omit<FoodFreezerItem, "id"> = {
        type: "food",
        name: foodName.trim(),
        ...(foodId ? { foodId } : {}),
        bags: [{
          id: crypto.randomUUID(),
          quantity: foodQty.trim(),
          unit: foodUnit,
          preparation: foodPreparation.trim() || undefined,
          addedDate: new Date().toISOString().slice(0, 10),
        }],
      };
      await addItemToCategory(categoryId, item);
    } else {
      const item: Omit<BatchFreezerItem, "id" | "addedDate"> = {
        type: "batch",
        recipeId: selectedRecipeId!,
        recipeName: selectedRecipe!.name,
        portions,
      };
      await addItemToCategory(categoryId, item);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="w-full sm:max-w-md bg-slate-50 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <h2 className="text-base font-black text-slate-900">Ajouter à la catégorie</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pb-4 shrink-0">
          <button
            onClick={() => setTab("food")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "food" ? "bg-slate-800 text-white" : "bg-slate-100 dark:bg-slate-200 text-slate-500"}`}
          >
            Aliment
          </button>
          <button
            onClick={() => setTab("batch")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "batch" ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-200 text-slate-500"}`}
          >
            Batch cooking
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 flex flex-col gap-4">
          {tab === "food" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom</label>
                <FoodSearchInput
                  value={foodName}
                  onChange={(name, id) => { setFoodName(name); setFoodId(id); }}
                />
                {foodId && (
                  <p className="text-xs text-orange-500 font-medium pl-1">✓ Lié à la base d'aliments</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Préparation <span className="normal-case font-normal">(optionnel)</span></label>
                <input
                  type="text"
                  value={foodPreparation}
                  onChange={e => setFoodPreparation(e.target.value)}
                  placeholder="Ex: émincé, en rondelles, entier..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quantité</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={foodQty}
                    onChange={e => setFoodQty(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5 w-36">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Unité</label>
                  <select
                    value={foodUnit}
                    onChange={e => setFoodUnit(e.target.value as Unit)}
                    className="w-full px-3 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  >
                    {FOOD_UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={e => { setRecipeSearch(e.target.value); setSelectedRecipeId(null); }}
                  placeholder="Chercher une recette..."
                  className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {recipes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRecipeId(r.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-colors ${
                      selectedRecipeId === r.id
                        ? "bg-orange-500 text-white"
                        : "bg-white dark:bg-slate-100 text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-200"
                    }`}
                  >
                    <span className="text-sm font-semibold truncate">{r.name}</span>
                    {r.isBatch && (
                      <span className={`shrink-0 ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedRecipeId === r.id ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
                        BATCH
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {selectedRecipeId && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre de repas</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPortions(p => Math.max(1, p - 1))}
                      className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-2xl font-black text-slate-900 w-8 text-center">{portions}</span>
                    <button
                      onClick={() => setPortions(p => p + 1)}
                      className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 pb-6 pt-3 shrink-0 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-colors text-sm"
          >
            {saving ? "Enregistrement..." : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
};
