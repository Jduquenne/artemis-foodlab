import { useMemo, useState } from "react";
import { Food } from "../../../../core/domain/ingredient";
import { useCatalogueFoods } from "../../../../shared/hooks/useCatalogueFoods";
import { FoodRow } from "./FoodRow";
import { FoodFormModal } from "./FoodFormModal";
import { DataPanelShell } from "../common/DataPanelShell";
import { DataList } from "../common/DataList";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { includesAnyText, normalizeQuery } from "../../../../core/utils/textUtils";

export const FoodsTable = () => {
  const { foods, create, save, remove } = useCatalogueFoods();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Food | null>(null);

  const filtered = useMemo(() => {
    const needle = normalizeQuery(query);
    if (!needle) return foods;
    return foods.filter((food) => includesAnyText([food.name, food.category], needle));
  }, [foods, query]);

  return (
    <DataPanelShell
      title="Aliments"
      count={filtered.length}
      search={{ value: query, onChange: setQuery }}
      onAdd={() => setCreating(true)}
    >
      <DataList isEmpty={filtered.length === 0} emptyMessage="Aucun aliment ne correspond.">
        {filtered.map((food) => (
          <FoodRow key={food.id} food={food} onEdit={setEditing} onAskDelete={setPendingDelete} />
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
