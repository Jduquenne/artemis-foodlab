import { Ban, Lock, ThumbsDown, ThumbsUp } from "lucide-react";

export type StrengthTone = "mandatory" | "preferred" | "avoid" | "forbidden";

export interface StrengthBadgeProps {
  tone: StrengthTone;
  label: string;
}

const TONE_CLASSES: Record<StrengthTone, string> = {
  mandatory: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  preferred: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  avoid: "bg-muted text-slate-500",
  forbidden: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
};

const TONE_ICONS = { mandatory: Lock, preferred: ThumbsUp, avoid: ThumbsDown, forbidden: Ban } as const;

export const StrengthBadge = ({ tone, label }: StrengthBadgeProps) => {
  const Icon = TONE_ICONS[tone];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${TONE_CLASSES[tone]}`}>
      <Icon size={10} />
      {label}
    </span>
  );
};
