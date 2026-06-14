export function parseJsonField<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    if (!value.trim()) return null;
    return JSON.parse(value) as T;
  }
  return null;
}
