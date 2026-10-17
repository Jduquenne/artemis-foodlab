import { WeeklyQuota } from "../../../../core/domain/menuGenerator";
import { HabitNames, habitTargetLabel } from "../../../../core/logic/menuGenerator/habitLogic";
import { QUOTA_STRICTNESS_LABELS, quotaSummary } from "../../../../core/logic/menuGenerator/quotaLogic";
import { RuleCard } from "./RuleCard";
import { StrengthBadge } from "./StrengthBadge";
import { TargetKindIcon } from "./TargetKindIcon";

export interface QuotaRowProps {
  quota: WeeklyQuota;
  names: HabitNames;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const QuotaRow = ({ quota, names, disabled, onToggle, onEdit, onDelete }: QuotaRowProps) => (
  <RuleCard
    icon={<TargetKindIcon kind={quota.target.kind} />}
    title={habitTargetLabel(quota.target, names)}
    subtitle={quotaSummary(quota)}
    badge={<StrengthBadge tone={quota.strictness === "strict" ? "mandatory" : "preferred"} label={QUOTA_STRICTNESS_LABELS[quota.strictness]} />}
    enabled={quota.enabled}
    disabled={disabled}
    onToggle={onToggle}
    onEdit={onEdit}
    onDelete={onDelete}
  />
);
