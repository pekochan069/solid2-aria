/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/radio-group-disabled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Field, FieldLabel } from "../registry/ui/field";
import { RadioGroup, RadioGroupItem } from "../registry/ui/radio-group";

export function RadioGroupDisabled() {
  return (
    <RadioGroup aria-label="Radios" defaultValue="option2" class="w-fit">
      <Field orientation="horizontal" data-disabled>
        <RadioGroupItem value="option1" id="disabled-1" isDisabled />
        <FieldLabel for="disabled-1" class="font-normal">
          Disabled
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="option2" id="disabled-2" />
        <FieldLabel for="disabled-2" class="font-normal">
          Option 2
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="option3" id="disabled-3" />
        <FieldLabel for="disabled-3" class="font-normal">
          Option 3
        </FieldLabel>
      </Field>
    </RadioGroup>
  );
}

export default RadioGroupDisabled;
