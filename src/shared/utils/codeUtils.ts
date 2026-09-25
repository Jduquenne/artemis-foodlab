import { padNumber } from "./numberUtils";

const CODE_FORMAT = /^[a-z]+-\d+$/;

export function highestSequence(codes: readonly string[], prefix: string): number {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  return codes.reduce((max, code) => {
    const match = pattern.exec(code);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
}

export function nextSequentialCode(prefix: string, codes: readonly string[], minWidth = 3): string {
  const digitsWidth = codes.reduce((width, code) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(code);
    return match ? Math.max(width, match[1].length) : width;
  }, minWidth);
  return `${prefix}-${padNumber(highestSequence(codes, prefix) + 1, digitsWidth)}`;
}

export function validateNewCode(code: string, existingCodes: readonly string[], example: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return "L'identifiant est requis.";
  if (!CODE_FORMAT.test(trimmed)) return `L'identifiant doit être au format « ${example} ».`;
  if (existingCodes.includes(trimmed)) return "Cet identifiant est déjà utilisé.";
  return null;
}
