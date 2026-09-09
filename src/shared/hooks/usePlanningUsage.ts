import { useEffect, useState } from "react";
import { RecipeUsageItem, getRecipeUsage } from "../../core/services/planningUsageService";

export interface UsePlanningUsageResult {
  usage: RecipeUsageItem[] | null;
  loading: boolean;
  error: boolean;
}

export function usePlanningUsage(): UsePlanningUsageResult {
  const [usage, setUsage] = useState<RecipeUsageItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getRecipeUsage()
      .then((items) => {
        if (active) setUsage(items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { usage, loading, error };
}
