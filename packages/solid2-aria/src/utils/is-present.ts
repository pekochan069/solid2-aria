/** Test for a present value while preserving the value's type. */
export function isPresent<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
