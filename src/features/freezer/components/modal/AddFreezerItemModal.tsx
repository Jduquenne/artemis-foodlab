import { useState } from "react";
import { X } from "lucide-react";
import { Unit, FoodFreezerItem, BatchFreezerItem } from "../../../../core/domain/types";
import { addItemToCategory } from "../../../../core/services/freezerService";
import { FoodTab } from "./FoodTab";
import { BatchTab } from "./BatchTab";

export interface AddFreezerItemModalProps {
  categoryId: string;
  existingFoodNames?: string[];
  onClose: () => void;
}

export const AddFreezerItemModal = ({ categoryId, existingFoodNames, onClose }: AddFreezerItemModalProps) => {
  const [tab, setTab] = useState<"food" | "batch">("food");
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [foodName, setFoodName] = useState("");
  const [foodId, setFoodId] = useState<string | undefined>(undefined);
  const [foodQty, setFoodQty] = useState("");
  const [foodUnit, setFoodUnit] = useState<Unit>(Unit.G);
  const [foodPreparation, setFoodPreparation] = useState("");

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedRecipeName, setSelectedRecipeName] = useState<string>("");
  const [portions, setPortions] = useState(1);

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 300); };

  const isDuplicateName = tab === "food" && (existingFoodNames ?? []).some(
    n => n.toLowerCase() === foodName.trim().toLowerCase()
  );

  const canSave =
    tab === "food" ? foodName.trim().length > 0 && foodQty.trim().length > 0 && !isDuplicateName
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
        recipeName: selectedRecipeName,
        portions,
      };
      await addItemToCategory(categoryId, item);
    }
    setSaving(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className={`w-full sm:max-w-md bg-slate-50 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90dvh] ${isClosing ? 'modal-exit sm:modal-center-exit' : 'modal-enter sm:modal-center-enter'}`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <h2 className="text-base font-black text-slate-900">Ajouter à la catégorie</h2>
          <button aria-label="Fermer" onClick={handleClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pb-4 shrink-0">
          <button
            onClick={() => setTab("food")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "food" ? "bg-slate-800 dark:bg-slate-100 text-white" : "bg-slate-100 dark:bg-slate-200 text-slate-500"}`}
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
            <FoodTab
              foodName={foodName}
              foodId={foodId}
              foodQty={foodQty}
              foodUnit={foodUnit}
              foodPreparation={foodPreparation}
              existingNames={existingFoodNames}
              onNameChange={(name, id) => { setFoodName(name); setFoodId(id); }}
              onQtyChange={setFoodQty}
              onUnitChange={setFoodUnit}
              onPreparationChange={setFoodPreparation}
            />
          ) : (
            <BatchTab
              selectedRecipeId={selectedRecipeId}
              portions={portions}
              onSelectRecipe={(id, name) => { setSelectedRecipeId(id); setSelectedRecipeName(name ?? ""); }}
              onPortionsChange={setPortions}
            />
          )}
        </div>

        <div className="px-5 pb-6 pt-3 shrink-0 border-t border-slate-200 flex flex-col gap-3">
          {isDuplicateName && (
            <p className="text-xs text-red-500 font-medium text-center">Cet aliment est déjà dans la catégorie</p>
          )}
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
