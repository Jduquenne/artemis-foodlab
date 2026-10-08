import { useMemo, useState } from "react";
import { OutdoorEntry } from "../../../../core/domain/recipe";
import { categoryLabel } from "../../../../core/logic/recipe/categoryLogic";
import { useCategoriesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { useCatalogueOutdoor } from "../../../../shared/hooks/useCatalogueOutdoor";
import { OutdoorRow } from "./OutdoorRow";
import { OutdoorFormModal } from "./OutdoorFormModal";
import { DataPanelShell } from "../common/DataPanelShell";
import { DataList } from "../common/DataList";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { includesAnyText, normalizeQuery } from "../../../../shared/utils/textUtils";

export const OutdoorActivitiesTable = () => {
  const { activities, create, save, remove } = useCatalogueOutdoor();
  const categories = useCategoriesSnapshot();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<OutdoorEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OutdoorEntry | null>(null);

  const filtered = useMemo(() => {
    const needle = normalizeQuery(query);
    if (!needle) return activities;
    return activities.filter((activity) => {
      const category = categories.find((c) => c.id === activity.categoryId)?.name ?? "";
      return includesAnyText([activity.name, category], needle);
    });
  }, [activities, categories, query]);

  return (
    <DataPanelShell
      title="Activités extérieures"
      count={filtered.length}
      search={{ value: query, onChange: setQuery }}
      onAdd={() => setCreating(true)}
    >
      <DataList isEmpty={filtered.length === 0} emptyMessage="Aucune activité ne correspond.">
        {filtered.map((activity) => (
          <OutdoorRow
            key={activity.code}
            activity={activity}
            onEdit={setEditing}
            onAskDelete={setPendingDelete}
          />
        ))}
      </DataList>

      {creating && (
        <OutdoorFormModal
          activity={null}
          activities={activities}
          onClose={() => setCreating(false)}
          onSubmit={(body, photo) => (photo ? create(body, photo) : Promise.resolve(false))}
        />
      )}
      {editing && (
        <OutdoorFormModal
          activity={editing}
          activities={activities}
          onClose={() => setEditing(null)}
          onSubmit={(body, photo) => save(editing.apiId, body, photo)}
        />
      )}
      {pendingDelete && (
        <ConfirmActionModal
          title="Confirmer la suppression de l'activité"
          recap={[
            { label: "Activité", value: pendingDelete.name },
            { label: "Identifiant", value: pendingDelete.code },
            { label: "Catégorie", value: categoryLabel(categories, pendingDelete.categoryId) },
          ]}
          consequence="L'activité sera retirée du catalogue. Si un planning l'utilise encore, l'API refusera la suppression."
          confirmLabel="Supprimer"
          danger
          onConfirm={async () => {
            const ok = await remove(pendingDelete.code);
            if (ok) setPendingDelete(null);
            return ok;
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </DataPanelShell>
  );
};
