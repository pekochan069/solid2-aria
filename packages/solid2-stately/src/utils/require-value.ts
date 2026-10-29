/** Check collection and layout invariants that TypeScript cannot infer from key or index bounds. */
export function requireValue<T>(value: T, message: string): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}
