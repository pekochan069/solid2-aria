/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/button-group-input-group.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { AudioLinesIcon, PlusIcon } from "@lucide/solid";
import { createSignal } from "solid-js";

import { Button } from "../registry/ui/button";
import { ButtonGroup } from "../registry/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../registry/ui/input-group";
import { Tooltip, TooltipTrigger } from "../registry/ui/tooltip";

export default function ButtonGroupInputGroup() {
  const [voiceEnabled, setVoiceEnabled] = createSignal(false);

  return (
    <ButtonGroup class="[--radius:9999rem]">
      <ButtonGroup>
        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroupInput
            placeholder={
              voiceEnabled() ? "Record and send audio..." : "Send a message..."
            }
            disabled={voiceEnabled()}
          />
          <InputGroupAddon align="inline-end">
            <TooltipTrigger>
              <InputGroupButton
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled());
                }}
                size="icon-xs"
                data-active={voiceEnabled()}
                class="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
                aria-pressed={voiceEnabled()}
              >
                <AudioLinesIcon />
              </InputGroupButton>
              <Tooltip>Voice Mode</Tooltip>
            </TooltipTrigger>
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  );
}
