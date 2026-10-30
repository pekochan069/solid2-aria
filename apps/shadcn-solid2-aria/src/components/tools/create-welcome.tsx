/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(create)/components/welcome-dialog.tsx and apps/v4/components/icons.tsx.
 * Modified for Solid Aria: Solid 2 lifecycle and local Solid2 Aria dialog controls, with Solid project wording.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, onSettled } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../registry/ui/dialog";

const storageKey = "shadcn-solid-create-welcome";

export function CreateWelcome() {
  const [open, setOpen] = createSignal(false);

  onSettled(() => {
    try {
      setOpen(localStorage.getItem(storageKey) !== "true");
    } catch {
      setOpen(true);
    }
  });

  function changeOpen(value: boolean) {
    setOpen(value);

    if (!value) {
      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        /* Dismissal still works without storage. */
      }
    }
  }

  return (
    <Dialog
      isOpen={open()}
      onOpenChange={changeOpen}
      showCloseButton={false}
      class="create-welcome"
    >
      <div class="create-welcome-logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          class="size-12"
          aria-hidden="true"
        >
          <rect width="256" height="256" fill="none" />
          <line
            x1="208"
            y1="128"
            x2="128"
            y2="208"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="32"
          />
          <line
            x1="192"
            y1="40"
            x2="40"
            y2="192"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="32"
          />
        </svg>
      </div>
      <DialogHeader class="gap-1 p-4">
        <DialogTitle class="text-left text-base">
          Build your own shadcn/solid
        </DialogTitle>
        <DialogDescription class="text-foreground text-left leading-relaxed">
          Customize everything from the ground up. Pick your component library,
          font, color scheme, and more.
        </DialogDescription>
        <DialogDescription class="text-foreground mt-2 text-left leading-relaxed font-medium">
          Built for Solid 2 with Solid2 Aria.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="m-0">
        <Button
          class="w-full"
          onPress={() => {
            changeOpen(false);
          }}
        >
          Get Started
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
