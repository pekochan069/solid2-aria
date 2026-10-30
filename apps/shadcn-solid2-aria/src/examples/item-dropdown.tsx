/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/item-dropdown.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon } from "@lucide/solid";
import { For } from "solid-js";

import { Avatar, AvatarFallback, AvatarImage } from "../registry/ui/avatar";
import { Button } from "../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
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

export function ItemDropdown() {
  return (
    <DropdownMenuTrigger>
      <Button variant="outline">
        Select <ChevronDownIcon />
      </Button>
      <DropdownMenu class="w-48" placement="bottom end">
        <DropdownMenuGroup>
          {
            <For each={people}>
              {(person) => (
                <DropdownMenuItem>
                  <Item size="xs" class="w-full p-2">
                    <ItemMedia>
                      <Avatar class="size-(--avatar-size) [--avatar-size:--spacing(6.5)]">
                        <AvatarImage src={person.avatar} class="grayscale" />
                        <AvatarFallback>
                          {person.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent class="gap-0">
                      <ItemTitle>{person.username}</ItemTitle>
                      <ItemDescription class="leading-none">
                        {person.email}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </DropdownMenuItem>
              )}
            </For>
          }
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

export default ItemDropdown;
