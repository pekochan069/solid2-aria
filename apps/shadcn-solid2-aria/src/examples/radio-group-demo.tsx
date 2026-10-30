/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/radio-group-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Label } from "../registry/ui/label";
import { RadioGroup, RadioGroupItem } from "../registry/ui/radio-group";

export function RadioGroupDemo() {
  return (
    <RadioGroup aria-label="Density" defaultValue="comfortable" class="w-fit">
      <div class="flex items-center gap-3">
        <RadioGroupItem value="default" id="r1" />
        <Label for="r1">Default</Label>
      </div>
      <div class="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label for="r2">Comfortable</Label>
      </div>
      <div class="flex items-center gap-3">
        <RadioGroupItem value="compact" id="r3" />
        <Label for="r3">Compact</Label>
      </div>
    </RadioGroup>
  );
}

export default RadioGroupDemo;
