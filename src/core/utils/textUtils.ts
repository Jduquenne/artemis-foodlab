export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

export function includesText(text: string, normalizedQuery: string): boolean {
  return text.toLowerCase().includes(normalizedQuery);
}

export function includesAnyText(texts: readonly string[], normalizedQuery: string): boolean {
  return texts.some((text) => includesText(text, normalizedQuery));
}

export function rankByQuery<T>(items: readonly T[], normalizedQuery: string, getText: (item: T) => string): T[] {
  const startsWith: T[] = [];
  const contains: T[] = [];
  for (const item of items) {
    const text = getText(item).toLowerCase();
    if (text.startsWith(normalizedQuery)) startsWith.push(item);
    else if (text.includes(normalizedQuery)) contains.push(item);
  }
  return [...startsWith, ...contains];
}
