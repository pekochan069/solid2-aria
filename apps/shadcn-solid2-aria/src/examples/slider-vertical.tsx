/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/slider-vertical.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Slider } from "../registry/ui/slider";

export function SliderVertical() {
  return (
    <div class="mx-auto flex w-full max-w-xs items-center justify-center gap-6">
      <Slider
        aria-label="Vertical slider"
        defaultValue={[50]}
        maxValue={100}
        step={1}
        orientation="vertical"
        class="h-40"
      />
      <Slider
        aria-label="Vertical slider"
        defaultValue={[25]}
        maxValue={100}
        step={1}
        orientation="vertical"
        class="h-40"
      />
    </div>
  );
}

export default SliderVertical;
