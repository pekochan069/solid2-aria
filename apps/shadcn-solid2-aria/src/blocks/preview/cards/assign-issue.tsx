/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/assign-issue.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PlusIcon } from "@lucide/solid";
import { For } from "solid-js";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../registry/ui/avatar";
import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "../../../registry/ui/combobox";
import { Tooltip, TooltipTrigger } from "../../../registry/ui/tooltip";

// Users available for assignment.
const users = [
  "shadcn",
  "maxleiter",
  "evilrabbit",
  "pranathip",
  "jorgezreik",
  "shuding",
  "rauchg",
];

export function AssignIssue() {
  return (
    <Card class="w-full max-w-sm" size="sm">
      <CardHeader class="border-b">
        <CardTitle class="text-sm">Assign Issue</CardTitle>
        <CardDescription class="text-sm">
          Select users to assign to this issue.
        </CardDescription>
        <CardAction>
          <TooltipTrigger>
            <Button variant="outline" size="icon-xs">
              <PlusIcon />
            </Button>
            <Tooltip>Add user</Tooltip>
          </TooltipTrigger>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Combobox
          selectionMode="multiple"
          defaultValue={["shadcn"]}
          allowsEmptyCollection
        >
          <ComboboxChips>
            <ComboboxChipList<{ username: string }>>
              {(value: { username: string }) => (
                <ComboboxChip id={value.username}>
                  <Avatar class="size-4">
                    <AvatarImage
                      src={`https://github.com/${value.username}.png`}
                      alt={value.username}
                    />
                    <AvatarFallback>{value.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {value.username}
                </ComboboxChip>
              )}
            </ComboboxChipList>
            <ComboboxChipsInput placeholder="Select a item..." />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList
              renderEmptyState={() => (
                <ComboboxEmpty>No users found.</ComboboxEmpty>
              )}
            >
              {
                <For each={users}>
                  {(username) => (
                    <ComboboxItem
                      id={username}
                      value={{ username }}
                      textValue={username}
                    >
                      <Avatar class="size-5">
                        <AvatarImage
                          src={`https://github.com/${username}.png`}
                          alt={username}
                        />
                        <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {username}
                    </ComboboxItem>
                  )}
                </For>
              }
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </CardContent>
    </Card>
  );
}

export default AssignIssue;
