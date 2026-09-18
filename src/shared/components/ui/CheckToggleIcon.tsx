import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export interface CheckToggleIconProps {
  checked: boolean;
  pending?: boolean;
  className?: string;
  checkedClassName?: string;
  uncheckedClassName?: string;
}

export const CheckToggleIcon = ({
  checked,
  pending,
  className = "w-3.5 h-3.5",
  checkedClassName = "text-green-500",
  uncheckedClassName = "text-slate-300",
}: CheckToggleIconProps) => {
  if (pending) return <Loader2 className={`${className} animate-spin text-orange-400 shrink-0`} />;
  return checked
    ? <CheckCircle2 className={`${className} ${checkedClassName} shrink-0`} />
    : <Circle className={`${className} ${uncheckedClassName} shrink-0`} />;
};
