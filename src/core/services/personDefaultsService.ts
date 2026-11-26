import { PersonDefault } from "../domain/personDefaults";
import { apiFetchJson } from "./apiClient";

export function savePersonDefaults(defaults: readonly PersonDefault[]): Promise<PersonDefault[]> {
  return apiFetchJson<PersonDefault[]>("/planning-person-defaults", { method: "PUT", body: { defaults } });
}
