import { isPresent } from "./is-present";

/** Check DOM and collection invariants that cannot be inferred from ref or index types. */
export function requireValue<T>(value: T, message: string): NonNullable<T> {
  if (!isPresent(value)) {
    throw new Error(message);
  }

  return value;
}
