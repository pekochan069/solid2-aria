/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/textarea-invalid.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Field, FieldDescription, FieldLabel } from "../registry/ui/field";
import { Textarea } from "../registry/ui/textarea";

export function TextareaInvalid() {
  return (
    <Field data-invalid>
      <FieldLabel for="textarea-invalid">Message</FieldLabel>
      <Textarea
        id="textarea-invalid"
        placeholder="Type your message here."
        aria-invalid="true"
      />
      <FieldDescription>Please enter a valid message.</FieldDescription>
    </Field>
  );
}

export default TextareaInvalid;
