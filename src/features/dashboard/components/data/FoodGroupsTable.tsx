import { useMemo, useState } from "react";
import { FoodGroup } from "../../../../core/domain/foodGroup";
import { foodsOfGroup } from "../../../../core/logic/dashboard/foodGroupFormLogic";
import { useCatalogueFoodGroups } from "../../../../shared/hooks/useCatalogueFoodGroups";
import { useCatalogueFoods } from "../../../../shared/hooks/useCatalogueFoods";
import { FoodGroupRow } from "./FoodGroupRow";
import { FoodGroupFormModal } from "./FoodGroupFormModal";
import { DataPanelShell } from "../common/DataPanelShell";
import { DataList } from "../common/DataList";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";

export const FoodGroupsTable = () => {
  const { groups, create, rename, remove } = useCatalogueFoodGroups();
  const { foods } = useCatalogueFoods();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<FoodGroup | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FoodGroup | null>(null);

  const membersByGroup = useMemo(
    () => new Map(groups.map((group) => [group.id, foodsOfGroup(foods, group.id)])),
    [groups, foods],
  );

  return (
    <DataPanelShell title="Familles d'aliments" count={groups.length} onAdd={() => setCreating(true)}>
      <DataList isEmpty={groups.length === 0} emptyMessage="Aucune famille pour le moment.">
        {groups.map((group) => (
          <FoodGroupRow
            key={group.id}
            group={group}
            memberCount={membersByGroup.get(group.id)?.length ?? 0}
            onEdit={setEditing}
            onAskDelete={setPendingDelete}
          />
        ))}
      </DataList>

      {creating && (
        <FoodGroupFormModal
          group={null}
          groups={groups}
          members={[]}
          onClose={() => setCreating(false)}
          onSubmit={(body) => create(body)}
        />
      )}
      {editing && (
        <FoodGroupFormModal
          group={editing}
          groups={groups}
          members={membersByGroup.get(editing.id) ?? []}
          onClose={() => setEditing(null)}
          onSubmit={(body) => rename(editing.id, body.name)}
        />
      )}
      {pendingDelete && (
        <ConfirmActionModal
          title="Confirmer la suppression de la famille"
          recap={[
            { label: "Famille", value: pendingDelete.name },
            { label: "Identifiant", value: pendingDelete.id },
            { label: "Aliments", value: String(membersByGroup.get(pendingDelete.id)?.length ?? 0) },
          ]}
          consequence="La famille sera retirée du catalogue. Si des aliments ou des ingrédients de recette l'utilisent encore, l'API refusera la suppression."
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
