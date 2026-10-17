import { MealReason, PeriodDay, QUOTA_BLOCK_DAYS, QuotaStrictness, QuotaTarget, WeeklyQuota } from "../../domain/menuGenerator";
import { formatSourceDayShort } from "../../utils/dateUtils";
import { RecipeDetails } from "../../domain/recipe";
import { pickRandom } from "../../utils/randomUtils";
import { HabitMatcher, HabitNames, habitTargetLabel, matchesHabitTarget, validateHabitTarget } from "./habitLogic";

export const QUOTA_SCORE = 3;

export type QuotaMode = "atLeast" | "atMost" | "between";

export const QUOTA_MODE_LABELS: Record<QuotaMode, string> = {
  atLeast: "Au moins",
  atMost: "Au plus",
  between: "Entre",
};

export const QUOTA_STRICTNESS_LABELS: Record<QuotaStrictness, string> = {
  strict: "Strict",
  preferred: "De préférence",
};

export const MAX_QUOTA_COUNT = 14;

export function emptyQuota(id: string): WeeklyQuota {
  return {
    id,
    enabled: true,
    target: { kind: "protein", protein: "fish" },
    min: 2,
    max: null,
    strictness: "strict",
    distinctFoods: false,
    noConsecutive: false,
  };
}

export function quotaMode(quota: Pick<WeeklyQuota, "min" | "max">): QuotaMode {
  if (quota.min !== null && quota.max !== null) return "between";
  return quota.max !== null ? "atMost" : "atLeast";
}

export function withQuotaMode(quota: WeeklyQuota, mode: QuotaMode): WeeklyQuota {
  const low = quota.min ?? quota.max ?? 1;
  const high = quota.max ?? quota.min ?? 1;
  if (mode === "atLeast") return { ...quota, min: low, max: null };
  if (mode === "atMost") return { ...quota, min: null, max: high };
  return { ...quota, min: Math.min(low, high), max: Math.max(low, high, 1) };
}

export function supportsDistinctFoods(target: QuotaTarget): boolean {
  return target.kind === "food" || target.kind === "family" || target.kind === "list";
}

export function validateQuota(quota: WeeklyQuota): string | null {
  if (quota.min === 0 && quota.max === null) return "« Au moins 0 » n'a pas d'effet : choisis au moins 1.";
  if (quota.min !== null && quota.max !== null && quota.min > quota.max) return "Le minimum dépasse le maximum.";
  return validateHabitTarget(quota.target);
}

export interface QuotaSlot {
  key: string;
  date: string;
  candidates: readonly RecipeDetails[];
}

export interface QuotaBlock {
  blockKey: string;
  label: string;
  dayCount: number;
  slots: readonly QuotaSlot[];
}

export function periodBlocks(days: readonly PeriodDay[]): Map<string, { blockKey: string; label: string }> {
  const result = new Map<string, { blockKey: string; label: string }>();
  for (let start = 0; start < days.length; start += QUOTA_BLOCK_DAYS) {
    const blockDays = days.slice(start, start + QUOTA_BLOCK_DAYS);
    const number = start / QUOTA_BLOCK_DAYS + 1;
    const range = `${formatSourceDayShort(blockDays[0].date)} → ${formatSourceDayShort(blockDays[blockDays.length - 1].date)}`;
    for (const day of blockDays) result.set(day.date, { blockKey: `block-${number}`, label: `Semaine ${number} (${range})` });
  }
  return result;
}

export function quotaCounterKey(quotaId: string, blockKey: string): string {
  return `${quotaId}|${blockKey}`;
}

export function quotaMinFor(quota: WeeklyQuota, dayCount: number): number {
  if (quota.min === null) return 0;
  return Math.round((quota.min * Math.min(dayCount, QUOTA_BLOCK_DAYS)) / QUOTA_BLOCK_DAYS);
}

function quotaCountLabel(quota: WeeklyQuota): string {
  const mode = quotaMode(quota);
  if (mode === "between") return `entre ${quota.min} et ${quota.max}`;
  return `${QUOTA_MODE_LABELS[mode].toLowerCase()} ${mode === "atLeast" ? quota.min : quota.max}`;
}

export function quotaSummary(quota: WeeklyQuota): string {
  const options = [quota.distinctFoods ? "aliments différents" : "", quota.noConsecutive ? "pas 2 fois de suite" : ""].filter(Boolean);
  return `${quotaCountLabel(quota)} / semaine${options.length > 0 ? ` · ${options.join(" · ")}` : ""}`;
}

export function quotaLabel(quota: WeeklyQuota, names: HabitNames): string {
  const strictness = QUOTA_STRICTNESS_LABELS[quota.strictness].toLowerCase();
  return `${habitTargetLabel(quota.target, names)} : ${quotaSummary(quota)} (${strictness})`;
}

export function matchesQuota(recipe: RecipeDetails, quota: WeeklyQuota, matcher: HabitMatcher): boolean {
  return matchesHabitTarget(recipe, quota.target, matcher);
}

export function quotaTargetFoods(recipe: RecipeDetails, quota: WeeklyQuota, matcher: HabitMatcher): string[] {
  const foods = [...matcher.foodsOf(recipe.code)];
  const { target } = quota;
  if (target.kind === "food") return foods.filter((foodId) => target.foodIds.includes(foodId));
  if (target.kind === "list") return foods.filter((foodId) => matcher.listFoods(target.listId).includes(foodId));
  if (target.kind === "family") return foods.filter((foodId) => matcher.foodGroupOf(foodId) === target.groupId);
  return [];
}

export function countsForQuota(
  recipe: RecipeDetails,
  quota: WeeklyQuota,
  matcher: HabitMatcher,
  usedFoods: ReadonlySet<string>,
): boolean {
  if (!matchesQuota(recipe, quota, matcher)) return false;
  if (!quota.distinctFoods || !supportsDistinctFoods(quota.target)) return true;
  return quotaTargetFoods(recipe, quota, matcher).some((foodId) => !usedFoods.has(foodId));
}

export function assignQuotaSlots(
  quotas: readonly WeeklyQuota[],
  blocks: readonly QuotaBlock[],
  counts: ReadonlyMap<string, number>,
  taken: ReadonlySet<string>,
  matcher: HabitMatcher,
  random: () => number,
): Record<string, string> {
  const assigned: Record<string, string> = {};
  for (const quota of quotas.filter((item) => item.min !== null && item.min > 0)) {
    for (const block of blocks) {
      const missing = quotaMinFor(quota, block.dayCount) - (counts.get(quotaCounterKey(quota.id, block.blockKey)) ?? 0);
      const usedDates = new Set<string>();
      const usedSlots = new Set<number>();
      for (let index = 0; index < missing; index += 1) {
        const options = block.slots.filter((slot, position) =>
          !assigned[slot.key]
          && !taken.has(slot.key)
          && !(quota.noConsecutive && (usedSlots.has(position - 1) || usedSlots.has(position + 1)))
          && slot.candidates.some((recipe) => matchesQuota(recipe, quota, matcher)),
        );
        const spread = options.filter((slot) => !usedDates.has(slot.date));
        const picked = pickRandom(spread.length > 0 ? spread : options, random);
        if (!picked) break;
        assigned[picked.key] = quota.id;
        usedDates.add(picked.date);
        usedSlots.add(block.slots.indexOf(picked));
      }
    }
  }
  return assigned;
}

export function quotaScore(
  recipe: RecipeDetails,
  quotas: readonly WeeklyQuota[],
  bonusQuotaId: string | null,
  countOf: (quotaId: string) => number,
  adjacentMatch: (quota: WeeklyQuota) => boolean,
  matcher: HabitMatcher,
  names: HabitNames,
): { score: number; reasons: MealReason[] } {
  let score = 0;
  const reasons: MealReason[] = [];
  for (const quota of quotas) {
    if (!matchesQuota(recipe, quota, matcher)) continue;
    if (quota.id === bonusQuotaId) {
      if (quota.strictness === "preferred") score += QUOTA_SCORE;
      reasons.push({ kind: "quota", label: `Quota : ${quotaLabel(quota, names)}` });
    }
    if (quota.strictness === "preferred" && quota.max !== null && countOf(quota.id) >= quota.max) {
      score -= QUOTA_SCORE;
      reasons.push({ kind: "quota", label: `Au-delà du quota : ${quotaLabel(quota, names)}` });
    }
    if (quota.strictness === "preferred" && quota.noConsecutive && adjacentMatch(quota)) {
      score -= QUOTA_SCORE;
      reasons.push({ kind: "quota", label: `Deux fois de suite malgré : ${quotaLabel(quota, names)}` });
    }
  }
  return { score, reasons };
}
