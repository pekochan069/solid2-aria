/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/switch-sizes.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Field, FieldGroup, FieldLabel } from "../registry/ui/field";
import { Switch } from "../registry/ui/switch";

export function SwitchSizes() {
  return (
    <FieldGroup class="w-full max-w-[10rem]">
      <Field orientation="horizontal">
        <Switch id="switch-size-sm" size="sm" />
        <FieldLabel for="switch-size-sm">Small</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Switch id="switch-size-default" size="default" />
        <FieldLabel for="switch-size-default">Default</FieldLabel>
      </Field>
    </FieldGroup>
  );
}

export default SwitchSizes;
