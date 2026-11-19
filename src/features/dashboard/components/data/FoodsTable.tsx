import { useMemo, useState } from "react";
import { Food } from "../../../../core/domain/ingredient";
import { FoodCooking } from "../../../../core/domain/cooking";
import { useCatalogueFoods } from "../../../../shared/hooks/useCatalogueFoods";
import { FoodRow } from "./FoodRow";
import { FoodFormModal } from "../../../../shared/components/ui/form/FoodFormModal";
import { DataPanelShell } from "../common/DataPanelShell";
import { DataList } from "../common/DataList";
import { useFoodGroupsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { includesAnyText, normalizeQuery } from "../../../../core/utils/textUtils";
import { FOOD_SEASON_FILTERS, FoodSeasonFilter, filterFoodsBySeason } from "../../../../core/logic/dashboard/foodTableLogic";
import { PillTabs } from "../common/PillTabs";
import { Euro } from "lucide-react";
import { useFoodPrices } from "../../../../shared/hooks/useFoodPrices";
import { PriceSliderModal } from "../prices/PriceSliderModal";
import { FoodPriceSheet } from "../prices/FoodPriceSheet";
import { FoodCookingModal } from "../cooking/FoodCookingModal";
import { useFoodCookings } from "../../../../shared/hooks/useFoodCookings";

const NO_COOKINGS: FoodCooking[] = [];

export const FoodsTable = () => {
  const { foods, create, save, remove } = useCatalogueFoods();
  const groups = useFoodGroupsSnapshot();
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<FoodSeasonFilter>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Food | null>(null);
  const [pricing, setPricing] = useState(false);
  const { store, priceByFood } = useFoodPrices();
  const [pricingFood, setPricingFood] = useState<Food | null>(null);
  const cookingsByFood = useFoodCookings();
  const [cooking, setCooking] = useState<Food | null>(null);

  const filtered = useMemo(() => {
    const needle = normalizeQuery(query);
    const bySeason = filterFoodsBySeason(foods, season);
    if (!needle) return bySeason;
    return bySeason.filter((food) => includesAnyText([food.name, food.category], needle));
  }, [foods, query, season]);

  return (
    <DataPanelShell
      title="Aliments"
      count={filtered.length}
      filters={
        <>
          <PillTabs tabs={FOOD_SEASON_FILTERS} value={season} onChange={setSeason} compact />
          <button
            type="button"
            onClick={() => setPricing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors shrink-0"
          >
            <Euro size={14} />
            Renseigner les prix
          </button>
        </>
      }
      search={{ value: query, onChange: setQuery }}
      onAdd={() => setCreating(true)}
    >
      <DataList isEmpty={filtered.length === 0} emptyMessage="Aucun aliment ne correspond.">
        {filtered.map((food) => (
          <FoodRow
            key={food.id}
            food={food}
            groupName={groups.find((group) => group.id === food.groupId)?.name ?? null}
            price={priceByFood.get(food.id)}
            cookings={cookingsByFood.get(food.id) ?? NO_COOKINGS}
            onEdit={setEditing}
            onEditCooking={setCooking}
            onEditPrice={store ? setPricingFood : null}
            onAskDelete={setPendingDelete}
          />
        ))}
      </DataList>

      {pricing && <PriceSliderModal onClose={() => setPricing(false)} />}
      {pricingFood && store && (
        <FoodPriceSheet
          food={pricingFood}
          store={store}
          price={priceByFood.get(pricingFood.id)}
          onClose={() => setPricingFood(null)}
        />
      )}
      {cooking && (
        <FoodCookingModal
          food={cooking}
          cookings={cookingsByFood.get(cooking.id) ?? NO_COOKINGS}
          onClose={() => setCooking(null)}
        />
      )}
      {creating && (
        <FoodFormModal
          food={null}
          foods={foods}
          onClose={() => setCreating(false)}
          onSubmit={(body) => create(body)}
        />
      )}
      {editing && (
        <FoodFormModal
          food={editing}
          foods={foods}
          onClose={() => setEditing(null)}
          onSubmit={(body) => save(editing.id, body)}
        />
      )}
      {pendingDelete && (
        <ConfirmActionModal
          title="Confirmer la suppression de l'aliment"
          recap={[
            { label: "Aliment", value: pendingDelete.name },
            { label: "Identifiant", value: pendingDelete.id },
            { label: "Catégorie", value: pendingDelete.category },
          ]}
          consequence="L'aliment sera retiré du catalogue. Si une recette l'utilise encore, l'API refusera la suppression."
          confirmLabel="Supprimer"
          danger
          onConfirm={async () => {
            const ok = await remove(pendingDelete.id);
            if (ok) setPendingDelete(null);
            return ok;
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </DataPanelShell>
  );
};
