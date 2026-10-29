export function ariaValue<const T>(
  value: T
): T extends boolean ? "true" | "false" : T;
export function ariaValue<T>(value: T) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return value;
}
