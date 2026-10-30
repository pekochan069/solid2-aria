/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-group-inline-start.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { SearchIcon } from "@lucide/solid";

import { Field, FieldDescription, FieldLabel } from "../registry/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../registry/ui/input-group";

export function InputGroupInlineStart() {
  return (
    <Field class="max-w-sm">
      <FieldLabel for="inline-start-input">Input</FieldLabel>
      <InputGroup>
        <InputGroupInput id="inline-start-input" placeholder="Search..." />
        <InputGroupAddon align="inline-start">
          <SearchIcon class="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>Icon positioned at the start.</FieldDescription>
    </Field>
  );
}

export default InputGroupInlineStart;
