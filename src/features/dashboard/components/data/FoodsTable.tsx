import { useMemo, useState } from "react";
import { Food } from "../../../../core/domain/ingredient";
import { useCatalogueFoods } from "../../../../shared/hooks/useCatalogueFoods";
import { FoodRow } from "./FoodRow";
import { FoodFormModal } from "./FoodFormModal";
import { DataPanelShell } from "../common/DataPanelShell";
import { DataList } from "../common/DataList";
import { useFoodGroupsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { includesAnyText, normalizeQuery } from "../../../../core/utils/textUtils";
import { FOOD_SEASON_FILTERS, FoodSeasonFilter, filterFoodsBySeason } from "../../../../core/logic/dashboard/foodTableLogic";
import { PillTabs } from "../common/PillTabs";

export const FoodsTable = () => {
  const { foods, create, save, remove } = useCatalogueFoods();
  const groups = useFoodGroupsSnapshot();
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<FoodSeasonFilter>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Food | null>(null);

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
      filters={<PillTabs tabs={FOOD_SEASON_FILTERS} value={season} onChange={setSeason} compact />}
      search={{ value: query, onChange: setQuery }}
      onAdd={() => setCreating(true)}
    >
      <DataList isEmpty={filtered.length === 0} emptyMessage="Aucun aliment ne correspond.">
        {filtered.map((food) => (
          <FoodRow
            key={food.id}
            food={food}
            groupName={groups.find((group) => group.id === food.groupId)?.name ?? null}
            onEdit={setEditing}
            onAskDelete={setPendingDelete}
          />
        ))}
      </DataList>

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
