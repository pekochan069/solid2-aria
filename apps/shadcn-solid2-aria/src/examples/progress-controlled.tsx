/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/progress-controlled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import { Progress } from "../registry/ui/progress";
import { Slider } from "../registry/ui/slider";

export function ProgressControlled() {
  const [value, setValue] = createSignal(50);

  return (
    <div class="flex w-full max-w-sm flex-col gap-4">
      <Progress aria-label="Loading" value={value()} class="w-full" />
      <Slider
        aria-label="Progress"
        value={value()}
        onChange={(valueValue) => {
          setValue(valueValue);
        }}
        minValue={0}
        maxValue={100}
        step={1}
      />
    </div>
  );
}

export default ProgressControlled;
