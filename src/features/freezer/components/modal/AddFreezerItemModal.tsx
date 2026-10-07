import { useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { FoodFreezerItem, BatchFreezerItem } from "../../../../core/domain/freezer";
import { Unit } from "../../../../core/domain/ingredient";
import { addItemToCategory } from "../../../../core/services/freezerService";
import { isFreezerFoodNameTaken } from "../../../../core/logic/freezer/freezerItemsLogic";
import { FoodTab } from "./FoodTab";
import { BatchTab } from "./BatchTab";
import { parseDecimal } from "../../../../shared/utils/numberUtils";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { withPending } from "../../../../shared/utils/withPending";

export interface AddFreezerItemModalProps {
  categoryId: string;
  existingFoodNames?: string[];
  onClose: () => void;
}

export const AddFreezerItemModal = ({ categoryId, existingFoodNames, onClose }: AddFreezerItemModalProps) => {
  const [tab, setTab] = useState<"food" | "batch">("food");
  const saving = usePendingKey(`freezer-item-add:${categoryId}`);
  const [isClosing, setIsClosing] = useState(false);

  const [foodName, setFoodName] = useState("");
  const [foodId, setFoodId] = useState<string | undefined>(undefined);
  const [foodQty, setFoodQty] = useState("");
  const [foodUnit, setFoodUnit] = useState<Unit>(Unit.G);
  const [foodPreparation, setFoodPreparation] = useState<string>("");

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedRecipeName, setSelectedRecipeName] = useState<string>("");
  const [portions, setPortions] = useState(1);

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 300); };

  const isDuplicateName = tab === "food" && isFreezerFoodNameTaken(existingFoodNames ?? [], foodName);

  const parsedFoodQty = parseDecimal(foodQty);
  const canSave =
    tab === "food" ? !!foodId && foodName.trim().length > 0 && parsedFoodQty !== null && parsedFoodQty > 0 && !isDuplicateName
      : selectedRecipeId !== null && portions > 0;

  const saveItem = async () => {
    if (tab === "food") {
      const item: Omit<FoodFreezerItem, "id"> = {
        type: "food",
        name: foodName.trim(),
        ...(foodId ? { foodId } : {}),
        bags: [{
          id: crypto.randomUUID(),
          quantity: parsedFoodQty ?? 0,
          unit: foodUnit,
          preparation: foodPreparation || undefined,
          addedDate: format(new Date(), "yyyy-MM-dd"),
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
  };

  const handleSave = async () => {
    if (!canSave) return;
    const saved = await withPending(`freezer-item-add:${categoryId}`, async () => {
      await saveItem();
      return true;
    }).catch(() => false);
    if (saved) handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className={`w-full sm:max-w-md bg-slate-50 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90dvh] ${isClosing ? 'modal-exit sm:modal-center-exit' : 'modal-enter sm:modal-center-enter'}`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <h2 className="text-base font-black text-slate-900">Ajouter à la catégorie</h2>
          <button aria-label="Fermer" onClick={handleClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pb-4 shrink-0">
          <button
            onClick={() => setTab("food")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "food" ? "bg-orange-500 text-white" : "bg-muted text-slate-500"}`}
          >
            Aliment
          </button>
          <button
            onClick={() => setTab("batch")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "batch" ? "bg-orange-500 text-white" : "bg-muted text-slate-500"}`}
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
