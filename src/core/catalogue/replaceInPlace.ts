export function replaceRecordInPlace<T>(target: Record<string, T>, next: Record<string, T>): void {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, next);
}

export function replaceArrayInPlace<T>(target: T[], next: readonly T[]): void {
  target.length = 0;
  target.push(...next);
}
