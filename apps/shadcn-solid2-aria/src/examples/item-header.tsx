/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/item-header.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "../registry/ui/item";
import { Image } from "./_support";

const models = [
  {
    credit: "Valeria Reverdo on Unsplash",
    description: "Everyday tasks and UI generation.",
    image:
      "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
    name: "v0-1.5-sm",
  },
  {
    credit: "Michael Oeser on Unsplash",
    description: "Advanced thinking or reasoning.",
    image:
      "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
    name: "v0-1.5-lg",
  },
  {
    credit: "Cherry Laithang on Unsplash",
    description: "Open Source model for everyone.",
    image:
      "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop",
    name: "v0-2.0-mini",
  },
];

export function ItemHeaderDemo() {
  return (
    <div class="flex w-full max-w-xl flex-col gap-6">
      <ItemGroup class="grid grid-cols-3 gap-4">
        {
          <For each={models}>
            {(model) => (
              <Item variant="outline">
                <ItemHeader>
                  <Image
                    src={model.image}
                    alt={model.name}
                    width={128}
                    height={128}
                    class="aspect-square w-full rounded-sm object-cover"
                  />
                </ItemHeader>
                <ItemContent>
                  <ItemTitle>{model.name}</ItemTitle>
                  <ItemDescription>{model.description}</ItemDescription>
                </ItemContent>
              </Item>
            )}
          </For>
        }
      </ItemGroup>
    </div>
  );
}

export default ItemHeaderDemo;
