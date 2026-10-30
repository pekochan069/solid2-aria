/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/carousel-api.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createEffect, createSignal, For } from "solid-js";

import { Card, CardContent } from "../registry/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../registry/ui/carousel";
import type { CarouselApi } from "../registry/ui/carousel";

export default function CarouselDApiDemo() {
  const [api, setApi] = createSignal<CarouselApi>();
  const [current, setCurrent] = createSignal(0);
  const [count, setCount] = createSignal(0);

  createEffect(
    () => api(),
    (instance) => {
      if (!instance) {
        return;
      }

      setCount(instance.scrollSnapList().length);
      setCurrent(instance.selectedScrollSnap() + 1);

      const onSelect = () => {
        setCurrent(instance.selectedScrollSnap() + 1);
      };

      instance.on("select", onSelect);

      // oxlint-disable-next-line typescript/consistent-return -- Setup returns cleanup only when the observed element exists.
      return () => {
        instance.off("select", onSelect);
      };
    }
  );

  return (
    <div class="mx-auto max-w-[10rem] sm:max-w-xs">
      <Carousel
        setApi={(value) => {
          setApi(value);
        }}
        class="w-full max-w-xs"
      >
        <CarouselContent>
          {
            <For each={Array.from({ length: 5 })}>
              {(_, index) => (
                <CarouselItem>
                  <Card class="m-px">
                    <CardContent class="flex aspect-square items-center justify-center p-6">
                      <span class="text-4xl font-semibold">{index() + 1}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              )}
            </For>
          }
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div class="text-muted-foreground py-2 text-center text-sm">
        Slide {current()} of {count()}
      </div>
    </div>
  );
}
