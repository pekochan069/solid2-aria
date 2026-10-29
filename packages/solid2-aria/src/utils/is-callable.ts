/** Narrow a callback at a dynamic component or browser API boundary. */
export function isCallable<T>(
  value: T
): value is T & ((...args: unknown[]) => void) {
  return typeof value === "function";
}
