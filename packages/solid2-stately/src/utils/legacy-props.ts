import type { Key, Validation } from "@solid2-aria/types-shared";

import type { SelectProps } from "../select/create-select-state";

type LegacySelectionProps = Pick<
  SelectProps<object>,
  "selectedKey" | "defaultSelectedKey" | "onSelectionChange"
>;

export function getLegacySelectedKey(
  props: LegacySelectionProps
): Key | null | undefined {
  // oxlint-disable-next-line typescript/no-deprecated, solid/reactivity -- The compatibility getter is evaluated in its caller's tracked scope.
  return props.selectedKey;
}

export function getLegacyDefaultSelectedKey(
  props: LegacySelectionProps
): Key | null | undefined {
  // oxlint-disable-next-line typescript/no-deprecated, solid/reactivity -- The compatibility getter is evaluated in its caller's tracked scope.
  return props.defaultSelectedKey;
}

export function notifyLegacySelectionChange(
  props: LegacySelectionProps,
  key: Key | null
): void {
  // oxlint-disable-next-line typescript/no-deprecated -- Notify existing consumers of the legacy callback alongside onChange.
  props.onSelectionChange?.(key);
}

export function getLegacyValidationState(
  props: Pick<Validation, "validationState">
) {
  // oxlint-disable-next-line typescript/no-deprecated, solid/reactivity -- The compatibility getter is evaluated in its caller's tracked scope.
  return props.validationState;
}
