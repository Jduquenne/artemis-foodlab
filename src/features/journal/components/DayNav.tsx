import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay } from "date-fns";

import { fr } from "date-fns/locale";
import { PageHeading } from "../../../shared/components/layout/PageHeading";

export interface DayNavProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
}

export const DayNav = ({ date, onPrev, onNext }: DayNavProps) => {
  const isToday = isSameDay(date, new Date());
  const label = isToday
    ? "Aujourd'hui"
    : format(date, "EEEE d MMMM", { locale: fr });

  return (
    <div className="flex items-center justify-between shrink-0">
      <PageHeading title="Journal" subtitle="Suivi nutritionnel quotidien" />

      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          aria-label="Jour précédent"
          className="p-1.5 rounded-xl text-slate-400 hover:bg-muted hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span
          className={`text-sm font-bold min-w-28 sm:min-w-36 text-center capitalize ${
            isToday ? "text-orange-600" : "text-slate-700"
          }`}
        >
          {label}
        </span>

        <button
          onClick={onNext}
          aria-label="Jour suivant"
          className="p-1.5 rounded-xl text-slate-400 hover:bg-muted hover:text-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
