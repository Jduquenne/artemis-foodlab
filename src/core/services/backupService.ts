import { serializeData, SyncScope, ALL_SCOPES } from "../utils/syncSerializer";

export const exportData = async (scope: SyncScope[] = ALL_SCOPES): Promise<void> => {
  const data = await serializeData(scope);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cipe-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
