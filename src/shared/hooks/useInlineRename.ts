import { useState } from "react";
import { withPending } from "../utils/withPending";
import { usePendingKey } from "./usePendingKey";

export function useInlineRename(current: string, pendingKey: string, save: (name: string) => Promise<unknown>) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  const pending = usePendingKey(pendingKey);

  const start = () => {
    setValue(current);
    setEditing(true);
  };

  const cancel = () => {
    setValue(current);
    setEditing(false);
  };

  const confirm = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === current) {
      cancel();
      return;
    }
    const saved = await withPending(pendingKey, async () => {
      await save(trimmed);
      return true;
    }).catch(() => false);
    if (saved) setEditing(false);
  };

  return { editing, value, setValue, pending, start, cancel, confirm };
}
