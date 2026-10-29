/** Combine independent flags without losing flags that were already present. */
export function addBits(mask: number, flags: number): number {
  // oxlint-disable-next-line eslint/no-bitwise -- Native DOM and drag APIs encode independent flags as bits.
  return mask | flags;
}

export function intersectBits(mask: number, flags: number): number {
  // oxlint-disable-next-line eslint/no-bitwise -- The intersection must retain only flags present in both masks.
  return mask & flags;
}

export function hasAnyBit(mask: number, flags: number): boolean {
  return intersectBits(mask, flags) !== 0;
}
