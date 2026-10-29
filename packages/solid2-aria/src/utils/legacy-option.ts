type LegacyOptionKey =
  | "closeOnSelect"
  | "isDisabled"
  | "isInvalid"
  | "isRequired"
  | "isSelected"
  | "isVirtualized"
  | "layout"
  | "onAction"
  | "onClose"
  | "orientation"
  | "selectedItem"
  | "selectedKey"
  | "setSelectedKey"
  | "shouldFocusOnHover"
  | "shouldSelectOnPressUp"
  | "shouldUseVirtualFocus"
  | "validationState";

/** Keep reads of supported legacy options at an explicit compatibility boundary. */
export function getLegacyOption<
  T extends object,
  K extends keyof T & LegacyOptionKey,
>(props: T, key: K): T[K] {
  return props[key];
}
