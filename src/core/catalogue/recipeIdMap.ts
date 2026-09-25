const codeById = new Map<string, string>();
const idByCode = new Map<string, string>();

export function setRecipeIdMap(entries: { code: string; apiId: string }[]): void {
  codeById.clear();
  idByCode.clear();
  for (const { code, apiId } of entries) {
    if (!apiId) continue;
    codeById.set(apiId, code);
    idByCode.set(code, apiId);
  }
}

export function getCodeById(apiId: string): string | undefined {
  return codeById.get(apiId);
}

export function getIdByCode(code: string): string | undefined {
  return idByCode.get(code);
}
