import type { CollectionBuilderContext } from "./create-table-state";

export function isTableCollectionContext<T>(
  context: unknown
): context is CollectionBuilderContext<T> {
  return (
    typeof context === "object" &&
    context !== null &&
    "columns" in context &&
    Array.isArray(context.columns) &&
    "selectionMode" in context &&
    (context.selectionMode === "none" ||
      context.selectionMode === "single" ||
      context.selectionMode === "multiple") &&
    "showSelectionCheckboxes" in context &&
    typeof context.showSelectionCheckboxes === "boolean" &&
    "showDragButtons" in context &&
    typeof context.showDragButtons === "boolean"
  );
}
