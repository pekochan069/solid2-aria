/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/slider/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { SliderState } from "@solid2-aria/stately/slider/create-slider-state";

interface SliderData {
  id: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
}

export const sliderData: WeakMap<SliderState, SliderData> = new WeakMap<
  SliderState,
  SliderData
>();

export function getSliderThumbId(state: SliderState, index: number): string {
  const data = sliderData.get(state);

  if (!data) {
    throw new Error("Unknown slider state");
  }

  return `${data.id}-${index}`;
}
