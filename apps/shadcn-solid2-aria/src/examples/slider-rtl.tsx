/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/slider-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Slider } from "../registry/ui/slider";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {},
  },
  en: {
    dir: "ltr",
    values: {},
  },
  he: {
    dir: "rtl",
    values: {},
  },
} satisfies Translations;

export function SliderRtl() {
  useTranslation(translations, "ar");

  return (
    <Slider
      aria-label="RTL slider"
      defaultValue={[75]}
      maxValue={100}
      step={1}
      class="mx-auto w-full max-w-xs"
    />
  );
}

export default SliderRtl;
