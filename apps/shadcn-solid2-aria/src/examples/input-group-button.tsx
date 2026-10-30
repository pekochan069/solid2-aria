/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-group-button.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  CheckIcon as IconCheck,
  CopyIcon as IconCopy,
  InfoIcon as IconInfoCircle,
  StarIcon as IconStar,
} from "@lucide/solid";
import { createSignal } from "solid-js";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../registry/ui/input-group";
import { Popover, PopoverTrigger } from "../registry/ui/popover";
import { useCopyToClipboard } from "./_support";

export default function InputGroupButtonExample() {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [isFavorite, setIsFavorite] = createSignal(false);

  return (
    <div class="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="https://x.com/shadcn" readonly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            size="icon-xs"
            onClick={() => {
              void copyToClipboard("https://x.com/shadcn");
            }}
          >
            {isCopied() ? <IconCheck /> : <IconCopy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup class="[--radius:9999px]">
        <PopoverTrigger>
          <InputGroupAddon>
            <InputGroupButton variant="secondary" size="icon-xs">
              <IconInfoCircle />
            </InputGroupButton>
          </InputGroupAddon>
          <Popover
            placement="bottom start"
            class="flex flex-col gap-1 rounded-xl text-sm"
          >
            <p class="font-medium">Your connection is not secure.</p>
            <p>You should not enter any sensitive information on this site.</p>
          </Popover>
        </PopoverTrigger>
        <InputGroupAddon class="text-muted-foreground pl-1.5">
          https://
        </InputGroupAddon>
        <InputGroupInput id="input-secure-19" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={() => {
              setIsFavorite(!isFavorite());
            }}
            size="icon-xs"
          >
            <IconStar
              data-favorite={isFavorite()}
              class="data-[favorite=true]:fill-blue-600 data-[favorite=true]:stroke-blue-600"
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Type to search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
