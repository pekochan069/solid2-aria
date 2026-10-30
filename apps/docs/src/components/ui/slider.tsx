/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/slider.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  SliderFill,
  Slider as SliderPrimitive,
  SliderThumb,
  SliderTrack,
} from "@solid2-aria/components";
import type { SliderProps as SliderPrimitiveProps } from "@solid2-aria/components";
import { Repeat, omit } from "solid-js";

import { cn } from "#lib/cn";

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
        "group relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        props.class
      )}
      data-slot="slider"
      {...rest}
    >
      {(renderProps0) => (
        <>
          <SliderTrack
            data-slot="slider-track"
            class="bg-muted relative grow overflow-hidden rounded-full select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
          >
            <SliderFill
              data-slot="slider-range"
              class="bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full"
            />
          </SliderTrack>
          <Repeat count={renderProps0.state.values.length}>
            {(index) => (
              <SliderThumb
                data-slot="slider-thumb"
                index={index}
                class="border-ring ring-ring/50 relative block size-3 shrink-0 rounded-full border bg-white transition-[color,box-shadow] select-none group-data-horizontal:top-[50%] group-data-vertical:left-[50%] after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
              />
            )}
          </Repeat>
        </>
      )}
    </SliderPrimitive>
  );
}

export { Slider };
