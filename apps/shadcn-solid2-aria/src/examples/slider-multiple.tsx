/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/slider-multiple.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Slider } from "../registry/ui/slider";

export function SliderMultiple() {
  return (
    <Slider
      aria-label="Multiple slider"
      defaultValue={[10, 20, 70]}
      maxValue={100}
      step={10}
      class="mx-auto w-full max-w-xs"
    />
  );
}

export default SliderMultiple;
