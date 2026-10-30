/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-badge.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Badge } from "../registry/ui/badge";
import { Field, FieldLabel } from "../registry/ui/field";
import { Input } from "../registry/ui/input";

export function InputBadge() {
  return (
    <Field>
      <FieldLabel for="input-badge">
        Webhook URL{" "}
        <Badge variant="secondary" class="ml-auto">
          Beta
        </Badge>
      </FieldLabel>
      <Input
        id="input-badge"
        type="url"
        placeholder="https://api.example.com/webhook"
      />
    </Field>
  );
}

export default InputBadge;
