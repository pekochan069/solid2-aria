/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/scroll-area-horizontal-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { ScrollArea } from "../registry/ui/scroll-area";
import { Image } from "./_support";

export interface Artwork {
  artist: string;
  art: string;
}

export const works: Artwork[] = [
  {
    art: "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80",
    artist: "Ornella Binni",
  },
  {
    art: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80",
    artist: "Tom Byrom",
  },
  {
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    artist: "Vladimir Malyavko",
  },
];

export function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea class="w-96 rounded-md border whitespace-nowrap">
      <div class="flex w-max space-x-4 p-4">
        {
          <For each={works}>
            {(artwork) => (
              <figure class="shrink-0">
                <div class="overflow-hidden rounded-md">
                  <Image
                    src={artwork.art}
                    alt={`Photo by ${artwork.artist}`}
                    class="aspect-[3/4] h-fit w-fit object-cover"
                    width={300}
                    height={400}
                  />
                </div>
                <figcaption class="text-muted-foreground pt-2 text-xs">
                  Photo by{" "}
                  <span class="text-foreground font-semibold">
                    {artwork.artist}
                  </span>
                </figcaption>
              </figure>
            )}
          </For>
        }
      </div>
    </ScrollArea>
  );
}

export default ScrollAreaHorizontalDemo;
