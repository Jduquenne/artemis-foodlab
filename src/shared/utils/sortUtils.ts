const FRENCH_COLLATOR = new Intl.Collator("fr");

export function compareText(a: string, b: string): number {
  return FRENCH_COLLATOR.compare(a, b);
}

export function compareByName(a: { name: string }, b: { name: string }): number {
  return compareText(a.name, b.name);
}
