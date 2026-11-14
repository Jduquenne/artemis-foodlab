import { CostEstimate, formatEuroRounded } from '../../../core/logic/price/priceLogic';

export interface PlanningCostLabelProps {
    estimate: CostEstimate;
    className?: string;
    compact?: boolean;
}

export const PlanningCostLabel = ({ estimate, className = '', compact = false }: PlanningCostLabelProps) => {
    const missing = estimate.missing.length;
    const title = missing > 0
        ? `Estimation indicative, incomplète : ${missing} article${missing > 1 ? 's' : ''} sans prix`
        : 'Estimation indicative';
    return (
        <span title={title} className={`tabular-nums ${missing > 0 ? 'text-amber-600' : ''} ${className}`}>
            {compact ? formatEuroRounded(estimate.total).replace(' ', '') : `≈ ${formatEuroRounded(estimate.total)}`}
        </span>
    );
};
