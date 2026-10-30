/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/command-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "@lucide/solid";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../registry/ui/command";

export function CommandDemo() {
  return (
    <Command class="max-w-sm rounded-lg border">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList
        renderEmptyState={() => <CommandEmpty>No results found.</CommandEmpty>}
      >
        <CommandGroup heading="Suggestions">
          <CommandItem textValue="Calendar">
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem textValue="Search Emoji">
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem textValue="Calculator" isDisabled>
            <Calculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem textValue="Profile">
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem textValue="Billing">
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem textValue="Settings">
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export default CommandDemo;
