import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Food } from "../../../../core/domain/types";
import { useCatalogueFoods } from "../../../../shared/hooks/useCatalogueFoods";
import { FoodRow } from "./FoodRow";
import { FoodFormModal } from "./FoodFormModal";
import { ConfirmActionModal } from "./ConfirmActionModal";

export const FoodsTable = () => {
  const { foods, create, save, remove } = useCatalogueFoods();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Food | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return foods;
    return foods.filter(
      (food) => food.name.toLowerCase().includes(needle) || food.category.toLowerCase().includes(needle),
    );
  }, [foods, query]);

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 flex flex-col overflow-hidden">
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-500 shrink-0">
          Aliments <span className="text-slate-400">· {filtered.length}</span>
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
          <p className="text-sm text-slate-400">Aucun aliment ne correspond.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
          {filtered.map((food) => (
            <FoodRow key={food.id} food={food} onEdit={setEditing} onAskDelete={setPendingDelete} />
          ))}
        </div>
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
    </div>
  );
};
