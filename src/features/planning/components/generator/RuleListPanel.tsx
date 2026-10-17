import { ReactNode, useState } from "react";
import { ArrowLeft, LucideIcon, Plus } from "lucide-react";
import { SettingsCard } from "./SettingsCard";

export interface RuleListPanelProps<T extends { id: string }> {
  icon: LucideIcon;
  title: string;
  description: string;
  emptyText: string;
  items: readonly T[];
  createItem: () => T;
  editorTitle: (item: T, isNew: boolean) => string;
  disabled: boolean;
  renderRow: (item: T, actions: { disabled: boolean; onEdit: () => void }) => ReactNode;
  renderEditor: (item: T, actions: { onSave: (item: T) => void; onCancel: () => void }) => ReactNode;
  onSave: (item: T) => void;
}

export const RuleListPanel = <T extends { id: string }>({
  icon,
  title,
  description,
  emptyText,
  items,
  createItem,
  editorTitle,
  disabled,
  renderRow,
  renderEditor,
  onSave,
}: RuleListPanelProps<T>) => {
  const [editing, setEditing] = useState<T | null>(null);

  if (editing) {
    const isNew = !items.some((item) => item.id === editing.id);
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="self-start flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs font-bold text-slate-500 hover:bg-muted hover:text-slate-700"
        >
          <ArrowLeft size={14} /> {editorTitle(editing, isNew)}
        </button>
        {renderEditor(editing, {
          onSave: (item) => {
            onSave(item);
            setEditing(null);
          },
          onCancel: () => setEditing(null),
        })}
      </div>
    );
  }

  return (
    <SettingsCard
      icon={icon}
      title={title}
      description={description}
      action={(
        <button
          type="button"
          onClick={() => setEditing(createItem())}
          disabled={disabled}
          className="flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Plus size={13} /> Ajouter
        </button>
      )}
    >
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-400">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-1.5">{items.map((item) => renderRow(item, { disabled, onEdit: () => setEditing(item) }))}</div>
      )}
    </SettingsCard>
  );
};
