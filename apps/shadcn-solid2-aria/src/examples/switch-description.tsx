/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/switch-description.tsx.
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

export function SwitchDescription() {
  return (
    <Field orientation="horizontal" class="max-w-sm">
      <FieldContent>
        <FieldLabel for="switch-focus-mode">Share across devices</FieldLabel>
        <FieldDescription>
          Focus is shared across devices, and turns off when you leave the app.
        </FieldDescription>
      </FieldContent>
      <Switch id="switch-focus-mode" />
    </Field>
  );
}

export default SwitchDescription;
