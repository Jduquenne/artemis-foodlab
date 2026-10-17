import { MealReason, PeriodDay, QuotaComparator, QuotaStrictness, WeeklyQuota } from "../../domain/menuGenerator";
import { RecipeDetails } from "../../domain/recipe";
import { pickRandom } from "../../utils/randomUtils";
import { HabitMatcher, HabitNames, habitTargetLabel, matchesHabitTarget } from "./habitLogic";

export const QUOTA_SCORE = 3;

export const QUOTA_COMPARATOR_LABELS: Record<QuotaComparator, string> = {
  atLeast: "Au moins",
  atMost: "Au plus",
};

export const QUOTA_STRICTNESS_LABELS: Record<QuotaStrictness, string> = {
  strict: "Strict",
  preferred: "De préférence",
};

const DAYS_PER_WEEK = 7;

export interface QuotaSlot {
  key: string;
  date: string;
  candidates: readonly RecipeDetails[];
}

export interface QuotaWeek {
  weekKey: string;
  label: string;
  dayCount: number;
  slots: readonly QuotaSlot[];
}

export function weekKeyOf(day: Pick<PeriodDay, "year" | "week">): string {
  return `${day.year}-W${day.week}`;
}

export function quotaCounterKey(quotaId: string, weekKey: string): string {
  return `${quotaId}|${weekKey}`;
}

export function quotaTarget(quota: WeeklyQuota, dayCount: number): number {
  if (quota.comparator === "atMost") return quota.count;
  return Math.round((quota.count * Math.min(dayCount, DAYS_PER_WEEK)) / DAYS_PER_WEEK);
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
  weeks: readonly QuotaWeek[],
  counts: ReadonlyMap<string, number>,
  taken: ReadonlySet<string>,
  matcher: HabitMatcher,
  random: () => number,
): Record<string, string> {
  const assigned: Record<string, string> = {};
  for (const quota of quotas.filter((item) => item.comparator === "atLeast")) {
    for (const week of weeks) {
      const missing = quotaTarget(quota, week.dayCount) - (counts.get(quotaCounterKey(quota.id, week.weekKey)) ?? 0);
      const usedDates = new Set<string>();
      for (let index = 0; index < missing; index += 1) {
        const options = week.slots.filter((slot) =>
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
