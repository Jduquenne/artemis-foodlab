import { useRef, useState } from "react";
import { MoreVertical, Copy, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { FreezerBag } from "../../../../core/domain/types";
import { addBagToFoodItem, removeBagFromFoodItem, updateBagInFoodItem } from "../../../../core/services/freezerService";
import { pluralizeUnit } from "../../../../shared/utils/unitUtils";
import { freezerItemAge } from "../../../../core/logic/freezer/freezerLogic";
import { FloatingMenu } from "../../../../shared/components/ui/FloatingMenu";
import { EditBagForm } from "./EditBagForm";

export interface BagRowProps {
    bag: FreezerBag;
    categoryId: string;
    itemId: string;
}

export const BagRow = ({ bag, categoryId, itemId }: BagRowProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const displayUnit = bag.unit ? " " + pluralizeUnit(bag.unit, bag.quantity) : "";
    const age = freezerItemAge(bag.addedDate);

    if (isEditing) {
        return (
            <EditBagForm
                bag={bag}
                onSave={({ addedDate, ...rest }) => {
                    updateBagInFoodItem(categoryId, itemId, bag.id, { ...rest, addedDate });
                    setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className="flex items-center gap-2 py-0.5">
            <span className="shrink-0 text-xs font-bold text-slate-700 tabular-nums">
                {bag.quantity}{displayUnit}
            </span>
            {bag.preparation && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-200 text-slate-500">
                    {bag.preparation}
                </span>
            )}
            <span className={`flex-1 min-w-0 flex items-center gap-1 truncate text-[11px] ${age.stale ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                {age.stale && <AlertTriangle className="w-3 h-3 shrink-0" />}
                {age.label}
            </span>

            <button
                ref={menuButtonRef}
                aria-label="Options du sac"
                onClick={() => setMenuOpen(o => !o)}
                className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
                <MoreVertical className="w-3.5 h-3.5" />
            </button>

            <FloatingMenu open={menuOpen} anchorRef={menuButtonRef} onClose={() => setMenuOpen(false)}>
                <button
                    onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
                >
                    <Pencil className="w-4 h-4 shrink-0" />
                    Modifier ce sac
                </button>
                <button
                    onClick={() => {
                        addBagToFoodItem(categoryId, itemId, {
                            quantity: bag.quantity,
                            unit: bag.unit,
                            preparation: bag.preparation,
                        });
                        setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors border-t border-slate-100"
                >
                    <Copy className="w-4 h-4 shrink-0" />
                    Dupliquer ce sac
                </button>
                <button
                    onClick={() => {
                        removeBagFromFoodItem(categoryId, itemId, bag.id);
                        setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
                >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    Supprimer ce sac
                </button>
            </FloatingMenu>
        </div>
    );
};
