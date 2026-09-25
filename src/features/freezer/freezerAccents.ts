import { FreezerCategory } from "../../core/domain/freezer";

export interface FreezerAccent {
  bar: string;
  badge: string;
  swatch: string;
}

export const FREEZER_ACCENTS: Record<string, FreezerAccent> = {
  rose: { bar: 'bg-rose-400', badge: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300', swatch: 'bg-rose-400' },
  orange: { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300', swatch: 'bg-orange-400' },
  amber: { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', swatch: 'bg-amber-400' },
  lime: { bar: 'bg-lime-400', badge: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300', swatch: 'bg-lime-400' },
  emerald: { bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', swatch: 'bg-emerald-400' },
  teal: { bar: 'bg-teal-400', badge: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300', swatch: 'bg-teal-400' },
  sky: { bar: 'bg-sky-400', badge: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300', swatch: 'bg-sky-400' },
  blue: { bar: 'bg-blue-400', badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300', swatch: 'bg-blue-400' },
  violet: { bar: 'bg-violet-400', badge: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300', swatch: 'bg-violet-400' },
  fuchsia: { bar: 'bg-fuchsia-400', badge: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-300', swatch: 'bg-fuchsia-400' },
};

export const FREEZER_COLOR_KEYS = Object.keys(FREEZER_ACCENTS);

export function getFreezerCategoryAccent(category: Pick<FreezerCategory, 'id' | 'color'>): FreezerAccent {
  if (category.color && FREEZER_ACCENTS[category.color]) return FREEZER_ACCENTS[category.color];
  let hash = 0;
  for (let i = 0; i < category.id.length; i++) hash = (hash * 31 + category.id.charCodeAt(i)) | 0;
  return FREEZER_ACCENTS[FREEZER_COLOR_KEYS[Math.abs(hash) % FREEZER_COLOR_KEYS.length]];
}
