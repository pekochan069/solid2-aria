/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/switch-invalid.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../registry/ui/field";
import { Switch } from "../registry/ui/switch";

export function SwitchInvalid() {
  return (
    <Field orientation="horizontal" class="max-w-sm" data-invalid>
      <FieldContent>
        <FieldLabel for="switch-terms">Accept terms and conditions</FieldLabel>
        <FieldDescription>
          You must accept the terms and conditions to continue.
        </FieldDescription>
      </FieldContent>
      <Switch id="switch-terms" data-invalid />
    </Field>
  );
}

export default SwitchInvalid;
