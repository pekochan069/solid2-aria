/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/carousel-plugin.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, createEffect, For } from "solid-js";

import { Card, CardContent } from "../registry/ui/card";
import type { CarouselApi } from "../registry/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../registry/ui/carousel";

export default function CarouselPlugin() {
  const [api, setApi] = createSignal<CarouselApi>();
  const [paused, setPaused] = createSignal(false);
  createEffect(
    () => [api(), paused()] as const,
    ([instance, isPaused]) => {
      if (!instance || isPaused) {
        return;
      }

      const timer = setInterval(() => {
        instance.scrollNext();
      }, 2000);

      // oxlint-disable-next-line typescript/consistent-return -- Setup returns cleanup only when the observed element exists.
      return () => {
        clearInterval(timer);
      };
    }
  );

  return (
    <Carousel
      setApi={(value) => {
        setApi(value);
      }}
      opts={{ loop: true }}
      class="w-full max-w-[10rem] sm:max-w-xs"
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
    >
      <CarouselContent>
        {
          <For each={Array.from({ length: 5 })}>
            {(_, index) => (
              <CarouselItem>
                <div class="p-1">
                  <Card>
                    <CardContent class="flex aspect-square items-center justify-center p-6">
                      <span class="text-4xl font-semibold">{index() + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )}
          </For>
        }
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
