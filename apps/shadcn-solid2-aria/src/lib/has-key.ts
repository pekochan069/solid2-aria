export function hasKey<T extends object>(
  value: T,
  key: PropertyKey
): key is keyof T {
  return Object.hasOwn(value, key);
}
