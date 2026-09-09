import { useState } from "react";
import { DATA_SECTIONS, DataSectionId } from "../../data/dataSections";
import { FoodsTable } from "./FoodsTable";
import { RecipesTable } from "./RecipesTable";

export const DataPanel = () => {
  const [section, setSection] = useState<DataSectionId>("foods");

  return (
    <div className="h-full flex flex-col gap-3">
      <nav className="shrink-0 flex gap-1">
        {DATA_SECTIONS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setSection(entry.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              section === entry.id
                ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
                : "text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-0">
        {section === "foods" && <FoodsTable />}
        {section === "recipes" && <RecipesTable />}
      </div>
    </div>
  );
};
