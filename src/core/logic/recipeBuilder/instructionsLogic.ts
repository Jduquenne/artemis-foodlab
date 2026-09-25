export function splitPastedInstructionLines(text: string): string[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function spliceInstructionPaste(
  steps: string[],
  index: number,
  before: string,
  after: string,
  pastedLines: string[],
): string[] {
  const inserted = [
    `${before}${pastedLines[0]}`,
    ...pastedLines.slice(1, -1),
    `${pastedLines[pastedLines.length - 1]}${after}`,
  ];
  return [...steps.slice(0, index), ...inserted, ...steps.slice(index + 1)];
}
