import type { Key } from "@solid2-aria/types-shared";

/** Resolves the conventional id/key fields when a data source has no getKey callback. */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- This function parses the conventional id/key metadata boundary for arbitrary caller-provided items.
export function getItemKey(item: unknown): Key {
  if (typeof item !== "object" || item === null) {
    throw new Error("Provide getKey for items without an id or key.");
  }

  const key =
    ("id" in item ? item.id : undefined) ??
    ("key" in item ? item.key : undefined);

  if (typeof key === "string" || typeof key === "number") {
    return key;
  }

  throw new Error(
    "Provide getKey for items without a string or number id or key."
  );
}
