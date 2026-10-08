export interface PillTab<T extends string> {
  id: T;
  label: string;
}

export interface PillTabsProps<T extends string> {
  tabs: readonly PillTab<T>[];
  value: T;
  onChange: (id: T) => void;
  compact?: boolean;
}

export const PillTabs = <T extends string>({ tabs, value, onChange, compact = false }: PillTabsProps<T>) => (
  <nav className="flex gap-1">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`${compact ? "px-2.5 py-1" : "px-3 py-1.5"} text-xs font-bold rounded-lg transition-colors ${
          value === tab.id
            ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
            : "text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);
