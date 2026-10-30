/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/switch-disabled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Field, FieldLabel } from "../registry/ui/field";
import { Switch } from "../registry/ui/switch";

export function SwitchDisabled() {
  return (
    <Field orientation="horizontal" data-disabled class="w-fit">
      <Switch id="switch-disabled-unchecked" isDisabled />
      <FieldLabel for="switch-disabled-unchecked">Disabled</FieldLabel>
    </Field>
  );
}

export default SwitchDisabled;
