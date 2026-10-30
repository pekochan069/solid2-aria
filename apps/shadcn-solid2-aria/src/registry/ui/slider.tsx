/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/slider.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  SliderFill,
  Slider as SliderPrimitive,
  SliderThumb,
  SliderTrack,
} from "@solid2-aria/components";
import type { SliderProps as SliderPrimitiveProps } from "@solid2-aria/components";
import { cn } from "cn";
import { omit, Repeat } from "solid-js";

type SliderValue = number | number[];

type SliderProps<T extends SliderValue = SliderValue> = Omit<
  SliderPrimitiveProps<T>,
  "class"
> & {
  class?: string;
};

function Slider<T extends SliderValue = SliderValue>(props: SliderProps<T>) {
  const rest = omit(props, "class");

  return (
    <SliderPrimitive
      class={cn(
        "cn-slider group relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
        props.class
      )}
      data-slot="slider"
      {...rest}
    >
      {(renderProps0) => (
        <>
          <SliderTrack
            data-slot="slider-track"
            class="cn-slider-track relative grow overflow-hidden select-none"
          >
            <SliderFill
              data-slot="slider-range"
              class="cn-slider-range absolute select-none data-horizontal:h-full data-vertical:w-full"
            />
          </SliderTrack>
          <Repeat count={renderProps0.state.values.length}>
            {(index) => (
              <SliderThumb
                data-slot="slider-thumb"
                index={index}
                class="cn-slider-thumb block shrink-0 select-none group-data-[orientation=horizontal]:top-1/2 group-data-[orientation=vertical]:left-1/2 disabled:pointer-events-none disabled:opacity-50"
              />
            )}
          </Repeat>
        </>
      )}
    </SliderPrimitive>
  );
}

export { Slider };
