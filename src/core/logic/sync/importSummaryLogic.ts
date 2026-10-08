export interface ImportResult {
  summary: {
    planning?: { slots: number; items: number };
    household?: { flags: number };
    freezer?: { categories: number; items: number };
  };
  anomalies: string[];
}

export function formatImportSummary({ summary }: ImportResult): string {
  const parts: string[] = [];
  if (summary.planning) parts.push(`${summary.planning.slots} créneaux (${summary.planning.items} plats)`);
  if (summary.freezer) parts.push(`${summary.freezer.categories} catégories congélateur (${summary.freezer.items} éléments)`);
  if (summary.household) parts.push(`${summary.household.flags} articles ménagers`);
  return parts.length > 0 ? parts.join(" · ") : "Aucune donnée importée.";
}
