import { apiFetch, apiFetchJson } from "./apiClient";
import { MacroTargets, Profile } from "../domain/types";
import { sortProfilesByPosition } from "../logic/profile/profileLogic";

export interface ApiProfile {
  id: string;
  name: string;
  color: string;
  position: number;
  kcalTarget: number;
  proteinsTarget: number;
  lipidsTarget: number;
  carbohydratesTarget: number;
  fibersTarget: number;
}

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

export function mapProfile(api: ApiProfile): Profile {
  return {
    id: api.id,
    name: api.name,
    color: api.color,
    position: api.position,
    kcalTarget: api.kcalTarget,
    macroTargets: {
      proteins: api.proteinsTarget,
      lipids: api.lipidsTarget,
      carbohydrates: api.carbohydratesTarget,
      fibers: api.fibersTarget,
    },
  };
}

export function mapProfiles(api: ApiProfile[]): Profile[] {
  return sortProfilesByPosition(api.map(mapProfile));
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

export async function fetchProfiles(): Promise<Profile[]> {
  return mapProfiles(await apiFetchJson<ApiProfile[]>("/profiles"));
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
