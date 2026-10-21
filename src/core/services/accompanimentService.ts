import { Accompaniment, AccompanimentInput } from "../domain/accompaniment";
import { ApiAccompaniment, buildAccompanimentPayload, mapAccompaniment } from "../logic/accompaniment/accompanimentApiMapper";
import { apiFetch, apiFetchJson } from "./apiClient";

export async function createAccompaniment(input: AccompanimentInput): Promise<Accompaniment> {
  return mapAccompaniment(
    await apiFetchJson<ApiAccompaniment>("/accompaniments", { method: "POST", body: buildAccompanimentPayload(input) }),
  );
}

export async function updateAccompaniment(id: string, input: AccompanimentInput): Promise<Accompaniment> {
  return mapAccompaniment(
    await apiFetchJson<ApiAccompaniment>(`/accompaniments/${id}`, { method: "PUT", body: buildAccompanimentPayload(input) }),
  );
}

export async function deleteAccompaniment(id: string): Promise<void> {
  await apiFetch(`/accompaniments/${id}`, { method: "DELETE" });
}
