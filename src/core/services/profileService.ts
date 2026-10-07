import { apiFetch, apiFetchJson } from "./apiClient";
import { MacroTargets } from "../domain/nutrition";
import { Profile } from "../domain/profile";
import { ApiProfile, mapProfile } from "../logic/profile/profileApiMapper";

export interface CreateProfileInput {
  name: string;
  color?: string;
}

export interface UpdateProfileInput {
  name?: string;
  color?: string;
  position?: number;
  kcalTarget?: number;
  macroTargets?: MacroTargets;
}

function buildUpdateBody(input: UpdateProfileInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.color !== undefined) body.color = input.color;
  if (input.position !== undefined) body.position = input.position;
  if (input.kcalTarget !== undefined) body.kcalTarget = input.kcalTarget;
  if (input.macroTargets) {
    body.proteinsTarget = input.macroTargets.proteins;
    body.lipidsTarget = input.macroTargets.lipids;
    body.carbohydratesTarget = input.macroTargets.carbohydrates;
    body.fibersTarget = input.macroTargets.fibers;
  }
  return body;
}

export async function createProfileApi(input: CreateProfileInput): Promise<Profile> {
  return mapProfile(await apiFetchJson<ApiProfile>("/profiles", { method: "POST", body: input }));
}

export async function updateProfileApi(id: string, input: UpdateProfileInput): Promise<Profile> {
  return mapProfile(
    await apiFetchJson<ApiProfile>(`/profiles/${id}`, { method: "PUT", body: buildUpdateBody(input) }),
  );
}

export async function deleteProfileApi(id: string): Promise<void> {
  await apiFetch(`/profiles/${id}`, { method: "DELETE" });
}
