/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/field-slider.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import { Field, FieldDescription, FieldTitle } from "../registry/ui/field";
import { Slider } from "../registry/ui/slider";

export default function FieldSlider() {
  const [value, setValue] = createSignal([200, 800]);

  return (
    <Field class="w-full max-w-xs">
      <FieldTitle>Price Range</FieldTitle>
      <FieldDescription>
        Set your budget range ($
        <span class="font-medium tabular-nums">{value()[0]}</span> -{" "}
        <span class="font-medium tabular-nums">{value()[1]}</span>).
      </FieldDescription>
      <Slider
        value={value()}
        onChange={(valueValue) => {
          setValue(valueValue);
        }}
        maxValue={1000}
        minValue={0}
        step={10}
        class="mt-2 w-full"
        aria-label="Price Range"
      />
    </Field>
  );
}
