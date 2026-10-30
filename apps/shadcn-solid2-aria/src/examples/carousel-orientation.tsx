/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/carousel-orientation.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Card, CardContent } from "../registry/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../registry/ui/carousel";

export default function CarouselOrientation() {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      orientation="vertical"
      class="w-full max-w-xs"
    >
      <CarouselContent class="-mt-1 h-[270px]">
        {
          <For each={Array.from({ length: 5 })}>
            {(_, index) => (
              <CarouselItem class="basis-1/2 pt-1">
                <div class="p-1">
                  <Card>
                    <CardContent class="flex items-center justify-center p-6">
                      <span class="text-3xl font-semibold">{index() + 1}</span>
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
