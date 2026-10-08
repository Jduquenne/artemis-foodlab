import { useState } from "react";
import { DATA_SECTIONS, DataSectionId } from "../../data/dataSections";
import { FoodsTable } from "./FoodsTable";
import { RecipesTable } from "./RecipesTable";
import { OutdoorActivitiesTable } from "./OutdoorActivitiesTable";
import { UsersPanel } from "../users/UsersPanel";
import { PillTabs } from "../common/PillTabs";

export const DataPanel = () => {
  const [section, setSection] = useState<DataSectionId>("foods");

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="shrink-0">
        <PillTabs tabs={DATA_SECTIONS} value={section} onChange={setSection} />
      </div>

      <div className="flex-1 min-h-0">
        {section === "foods" && <FoodsTable />}
        {section === "recipes" && <RecipesTable />}
        {section === "outdoor" && <OutdoorActivitiesTable />}
        {section === "users" && <UsersPanel />}
      </div>
    </div>
  );
};
