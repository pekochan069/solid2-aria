type Falsy = false | 0 | 0n | "" | null | undefined;

type FalsyValue<T> = T extends object
  ? never
  : T extends string
    ? "" extends T
      ? ""
      : never
    : T extends number
      ? T
      : T extends bigint
        ? 0n extends T
          ? 0n
          : never
        : T extends true
          ? never
          : T;

export function isTruthy<T>(value: T): value is Exclude<T, Falsy> {
  return Boolean(value);
}

export function getTruthyValue<T extends object>(value: T): T;
export function getTruthyValue<T>(value: T): Exclude<T, Falsy> | undefined;
export function getTruthyValue<T>(value: T): Exclude<T, Falsy> | undefined {
  return isTruthy(value) ? value : undefined;
}

export function whenTruthy<T, U>(
  value: T,
  read: (value: Exclude<T, Falsy>) => U
): FalsyValue<T> | U;
export function whenTruthy<T, U>(
  value: T,
  read: (value: Exclude<T, Falsy>) => U
): T | U {
  return isTruthy(value) ? read(value) : value;
}
