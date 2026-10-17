import { MealReason, PeriodDay, QUOTA_BLOCK_DAYS, QuotaComparator, QuotaStrictness, WeeklyQuota } from "../../domain/menuGenerator";
import { formatSourceDayShort } from "../../utils/dateUtils";
import { RecipeDetails } from "../../domain/recipe";
import { pickRandom } from "../../utils/randomUtils";
import { HabitMatcher, HabitNames, habitTargetLabel, matchesHabitTarget, validateHabitTarget } from "./habitLogic";

export const QUOTA_SCORE = 3;

export const QUOTA_COMPARATOR_LABELS: Record<QuotaComparator, string> = {
  atLeast: "Au moins",
  atMost: "Au plus",
};

export const QUOTA_STRICTNESS_LABELS: Record<QuotaStrictness, string> = {
  strict: "Strict",
  preferred: "De préférence",
};

export const MAX_QUOTA_COUNT = 14;

export function emptyQuota(id: string): WeeklyQuota {
  return { id, enabled: true, target: { kind: "protein", protein: "fish" }, comparator: "atLeast", count: 2, strictness: "strict" };
}

export function validateQuota(quota: WeeklyQuota): string | null {
  if (quota.comparator === "atLeast" && quota.count === 0) return "« Au moins 0 » n'a pas d'effet : choisis au moins 1.";
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

export function quotaTarget(quota: WeeklyQuota, dayCount: number): number {
  if (quota.comparator === "atMost") return quota.count;
  return Math.round((quota.count * Math.min(dayCount, QUOTA_BLOCK_DAYS)) / QUOTA_BLOCK_DAYS);
}

export function quotaLabel(quota: WeeklyQuota, names: HabitNames): string {
  const comparator = QUOTA_COMPARATOR_LABELS[quota.comparator].toLowerCase();
  const strictness = QUOTA_STRICTNESS_LABELS[quota.strictness].toLowerCase();
  return `${habitTargetLabel(quota.target, names)} : ${comparator} ${quota.count} / semaine (${strictness})`;
}

export function matchesQuota(recipe: RecipeDetails, quota: WeeklyQuota, matcher: HabitMatcher): boolean {
  return matchesHabitTarget(recipe, quota.target, matcher);
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
  for (const quota of quotas.filter((item) => item.comparator === "atLeast")) {
    for (const block of blocks) {
      const missing = quotaTarget(quota, block.dayCount) - (counts.get(quotaCounterKey(quota.id, block.blockKey)) ?? 0);
      const usedDates = new Set<string>();
      for (let index = 0; index < missing; index += 1) {
        const options = block.slots.filter((slot) =>
          !assigned[slot.key] && !taken.has(slot.key) && slot.candidates.some((recipe) => matchesQuota(recipe, quota, matcher)),
        );
        const spread = options.filter((slot) => !usedDates.has(slot.date));
        const picked = pickRandom(spread.length > 0 ? spread : options, random);
        if (!picked) break;
        assigned[picked.key] = quota.id;
        usedDates.add(picked.date);
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
  matcher: HabitMatcher,
  names: HabitNames,
): { score: number; reasons: MealReason[] } {
  let score = 0;
  const reasons: MealReason[] = [];
  for (const quota of quotas) {
    if (!matchesQuota(recipe, quota, matcher)) continue;
    if (quota.comparator === "atLeast" && quota.id === bonusQuotaId) {
      if (quota.strictness === "preferred") score += QUOTA_SCORE;
      reasons.push({ kind: "quota", label: `Quota : ${quotaLabel(quota, names)}` });
    }
    if (quota.comparator === "atMost" && quota.strictness === "preferred" && countOf(quota.id) >= quota.count) {
      score -= QUOTA_SCORE;
      reasons.push({ kind: "quota", label: `Au-delà du quota : ${quotaLabel(quota, names)}` });
    }
  }
  return { score, reasons };
}
