export function createCardCache<T>(build: (data: T) => string): (data: T) => string {
  const cache = new Map<string, string>();
  return (data) => {
    const key = JSON.stringify(data);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const svg = build(data);
    cache.set(key, svg);
    return svg;
  };
}
