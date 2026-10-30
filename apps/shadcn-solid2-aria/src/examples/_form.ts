export function formString(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" ? value : (value?.name ?? null);
}
