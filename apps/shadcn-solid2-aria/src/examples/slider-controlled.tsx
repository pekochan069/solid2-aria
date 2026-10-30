/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/slider-controlled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import { Label } from "../registry/ui/label";
import { Slider } from "../registry/ui/slider";

export function SliderControlled() {
  const [value, setValue] = createSignal([0.3, 0.7]);

  return (
    <div class="mx-auto grid w-full max-w-xs gap-3">
      <div class="flex items-center justify-between gap-2">
        <Label for="slider-demo-temperature">Temperature</Label>
        <span class="text-muted-foreground text-sm">{value().join(", ")}</span>
      </div>
      <Slider
        aria-label="Temperature"
        id="slider-demo-temperature"
        value={value()}
        onChange={(valueValue) => {
          setValue(valueValue);
        }}
        minValue={0}
        maxValue={1}
        step={0.1}
      />
    </div>
  );
}

export default SliderControlled;
