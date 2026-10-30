/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/item-image.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../registry/ui/item";
import { Image } from "./_support";

const music = [
  {
    album: "Electric Nights",
    artist: "Neon Dreams",
    duration: "3:45",
    title: "Midnight City Lights",
  },
  {
    album: "Urban Stories",
    artist: "The Morning Brew",
    duration: "4:05",
    title: "Coffee Shop Conversations",
  },
  {
    album: "Binary Beats",
    artist: "Cyber Symphony",
    duration: "3:30",
    title: "Digital Rain",
  },
];

export function ItemImage() {
  return (
    <div class="flex w-full max-w-md flex-col gap-6">
      <ItemGroup class="gap-4">
        {
          <For each={music}>
            {(song) => (
              <Item href="#" variant="outline" role="listitem">
                <ItemMedia variant="image">
                  <Image
                    src={`https://avatar.vercel.sh/${song.title}`}
                    alt={song.title}
                    width={32}
                    height={32}
                    class="object-cover grayscale"
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle class="line-clamp-1">
                    {song.title} -{" "}
                    <span class="text-muted-foreground">{song.album}</span>
                  </ItemTitle>
                  <ItemDescription>{song.artist}</ItemDescription>
                </ItemContent>
                <ItemContent class="flex-none text-center">
                  <ItemDescription>{song.duration}</ItemDescription>
                </ItemContent>
              </Item>
            )}
          </For>
        }
      </ItemGroup>
    </div>
  );
}

export default ItemImage;
