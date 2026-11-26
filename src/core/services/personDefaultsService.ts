import { PersonDefault } from "../domain/personDefaults";
import { apiFetchJson } from "./apiClient";

export async function savePersonDefaults(defaults: readonly PersonDefault[]): Promise<PersonDefault[]> {
  const response = await apiFetchJson<{ defaults: PersonDefault[] }>("/planning-person-defaults", {
    method: "PUT",
    body: { defaults },
  });
  return response.defaults;
}
