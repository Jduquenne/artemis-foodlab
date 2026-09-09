import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { OutdoorEntry } from "../../../../core/domain/types";
import { getCategoryById } from "../../../../core/domain/categories";
import { useCatalogueOutdoor } from "../../../../shared/hooks/useCatalogueOutdoor";
import { OutdoorRow } from "./OutdoorRow";
import { OutdoorFormModal } from "./OutdoorFormModal";
import { ConfirmDeleteOutdoorModal } from "./ConfirmDeleteOutdoorModal";

export const OutdoorActivitiesTable = () => {
  const { activities, create, save, remove } = useCatalogueOutdoor();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<OutdoorEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OutdoorEntry | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return activities;
    return activities.filter((activity) => {
      const category = getCategoryById(activity.categoryId)?.name ?? "";
      return (
        activity.name.toLowerCase().includes(needle) || category.toLowerCase().includes(needle)
      );
    });
  }, [activities, query]);

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 flex flex-col overflow-hidden">
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-500 shrink-0">
          Activités extérieures <span className="text-slate-400">· {filtered.length}</span>
        </h2>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-100 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shrink-0"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </header>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-slate-400">Aucune activité ne correspond.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
          {filtered.map((activity) => (
            <OutdoorRow
              key={activity.code}
              activity={activity}
              onEdit={setEditing}
              onAskDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {creating && (
        <OutdoorFormModal
          activity={null}
          activities={activities}
          onClose={() => setCreating(false)}
          onSubmit={(body) => create(body)}
        />
      )}
      {editing && (
        <OutdoorFormModal
          activity={editing}
          activities={activities}
          onClose={() => setEditing(null)}
          onSubmit={(body) => save(editing.apiId, body)}
        />
      )}
      {pendingDelete && (
        <ConfirmDeleteOutdoorModal
          activity={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
};
