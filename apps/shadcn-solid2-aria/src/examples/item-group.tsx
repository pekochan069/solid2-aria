/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/item-group.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PlusIcon } from "@lucide/solid";
import { For } from "solid-js";

import { Avatar, AvatarFallback, AvatarImage } from "../registry/ui/avatar";
import { Button } from "../registry/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../registry/ui/item";

const people = [
  {
    avatar: "/avatars/01.png",
    email: "alex@example.com",
    username: "alex",
  },
  {
    avatar: "/avatars/02.png",
    email: "jamie@example.com",
    username: "jamie",
  },
  {
    avatar: "/avatars/03.png",
    email: "taylor@example.com",
    username: "taylor",
  },
];

export function ItemGroupExample() {
  return (
    <ItemGroup class="max-w-sm">
      {
        <For each={people}>
          {(person, _index) => (
            <Item variant="outline">
              <ItemMedia>
                <Avatar>
                  <AvatarImage src={person.avatar} class="grayscale" />
                  <AvatarFallback>{person.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent class="gap-1">
                <ItemTitle>{person.username}</ItemTitle>
                <ItemDescription>{person.email}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon" class="rounded-full">
                  <PlusIcon />
                </Button>
              </ItemActions>
            </Item>
          )}
        </For>
      }
    </ItemGroup>
  );
}

export default ItemGroupExample;
