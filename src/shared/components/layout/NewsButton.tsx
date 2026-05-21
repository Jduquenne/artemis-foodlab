import { Sparkles } from "lucide-react";

export interface NewsButtonProps {
  hasNew: boolean;
  onOpen: () => void;
}

export const NewsButton = ({ hasNew, onOpen }: NewsButtonProps) => (
  <div className="relative">
    <button
      onClick={onOpen}
      title="Nouveautés"
      className="p-2.5 tablet:p-3 rounded-xl transition-colors text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-slate-600"
    >
      <Sparkles className="w-5 h-5" />
    </button>
    {hasNew && (
      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-orange-500 rounded-full pointer-events-none" />
    )}
  </div>
);
