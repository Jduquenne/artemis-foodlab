function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function withBatchLinkedQuantity(item: unknown): unknown {
  if (!isRecord(item) || item.type !== "batch" || typeof item.linkedQuantity === "number") return item;
  return { ...item, linkedQuantity: 0 };
}

export function withLinkedQuantity(items: unknown): unknown {
  return Array.isArray(items) ? items.map(withBatchLinkedQuantity) : items;
}
