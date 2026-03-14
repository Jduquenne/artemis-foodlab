import { useNavigate } from "react-router-dom";
import { MealSlot } from "../../../../core/domain/types";
import { MealSlot as MealSlotComp } from "./MealSlot";
import { MultiMealSlot } from "./MultiMealSlot";
import { MealSlotDef } from "../../../../core/domain/planningConfig";
import { SlotCopyProps } from "../../../../core/utils/planningUtils";

export interface PlanningSlotProps {
  mealType: MealSlotDef;
  slotId: string;
  savedMeal: MealSlot | undefined;
  isEditingPersons: boolean;
  isDimmed: boolean;
  isAnyEditing: boolean;
  isSelectionMode: boolean;
  isAddMode: boolean;
  isCopyMode: boolean;
  copyProps: SlotCopyProps;
  onOpenPicker: () => void;
  onOpenDessertPicker: () => void;
  onDelete: () => void;
  onAddToSlot: () => void;
  onEditPersons: () => void;
  onConfirmPersons: (n: number) => void;
  onCancelPersons: () => void;
  onRemoveRecipe: (id: string) => void;
  onSaveRecipeMeta: (rid: string, p: number, g: number) => void;
  onCopyRecipe: (id: string) => void;
  onCopyDessert: (id: string) => void;
  onRemoveDessert: (id: string) => void;
  onSelectAsTarget: () => void;
}

export const PlanningSlot = ({
  mealType, slotId, savedMeal,
  isEditingPersons, isDimmed,
  isAnyEditing, isSelectionMode, isAddMode, isCopyMode,
  copyProps,
  onOpenPicker, onOpenDessertPicker, onDelete, onAddToSlot,
  onEditPersons, onConfirmPersons, onCancelPersons,
  onRemoveRecipe, onSaveRecipeMeta,
  onCopyRecipe, onCopyDessert, onRemoveDessert, onSelectAsTarget,
}: PlanningSlotProps) => {
  const navigate = useNavigate();
  const recipeIds = savedMeal?.recipeIds ?? [];
  const blocked = isSelectionMode || isAddMode || isCopyMode;

  return (
    <div className={`relative h-full w-full min-h-0 min-w-0 transition-opacity ${isDimmed ? "pointer-events-none opacity-30" : ""}`}>
      {mealType.multi ? (
        <MultiMealSlot
          label={mealType.label}
          icon={mealType.icon}
          slotId={slotId}
          recipeIds={recipeIds}
          onAdd={blocked ? () => {} : onOpenPicker}
          onRemoveRecipe={blocked ? () => {} : onRemoveRecipe}
          onNavigateToRecipe={isAddMode || isCopyMode ? () => {} : (rid) => navigate(`/recipes/detail/${rid}`)}
          isAddMode={isAddMode}
          onAddToSlot={isAddMode ? onAddToSlot : undefined}
          onCopyRecipe={!blocked ? onCopyRecipe : undefined}
          copyTargetState={copyProps.multiCopyTargetState}
          onSelectAsTarget={
            copyProps.multiCopyTargetState === "selectable" || copyProps.multiCopyTargetState === "selected"
              ? onSelectAsTarget
              : undefined
          }
          recipePersons={savedMeal?.recipePersons}
          recipeQuantities={savedMeal?.recipeQuantities}
          onSaveRecipeMeta={!blocked ? onSaveRecipeMeta : undefined}
        />
      ) : (
        <MealSlotComp
          label={mealType.label}
          icon={mealType.icon}
          slotId={slotId}
          recipeIds={recipeIds}
          persons={savedMeal?.persons}
          isEditingPersons={isEditingPersons}
          isAnyEditing={isAnyEditing || isCopyMode}
          onNavigate={() => navigate(`/recipes/detail/${savedMeal!.recipeIds[0]}`)}
          onOpenPicker={blocked ? () => {} : onOpenPicker}
          onModify={blocked ? () => {} : onOpenPicker}
          onDelete={blocked ? () => {} : onDelete}
          onOpenPersonsEditor={isAddMode || isCopyMode ? () => {} : onEditPersons}
          onConfirmPersons={onConfirmPersons}
          onCancelPersons={onCancelPersons}
          isAddMode={isAddMode}
          onAddToSlot={isAddMode ? onAddToSlot : undefined}
          hasDessert={mealType.hasDessert}
          dessertIds={savedMeal?.dessertIds ?? []}
          onAddDessert={blocked ? undefined : onOpenDessertPicker}
          onRemoveDessert={isCopyMode ? undefined : onRemoveDessert}
          onCopyDessert={!blocked ? onCopyDessert : undefined}
          copySourceDessertId={copyProps.copySourceDessertId}
          dessertCopyTargetState={copyProps.dessertCopyTargetState}
          onSelectDessertAsTarget={copyProps.dessertCopyTargetState ? onSelectAsTarget : undefined}
        />
      )}
    </div>
  );
};

