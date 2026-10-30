/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(typeset)/components/main-menu.tsx and apps/v4/app/(app)/(create)/components/main-menu.tsx.
 * Modified for Solid Aria: Solid 2 tool history, theme, clipboard, and documentation actions.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import Menu09Icon from "@hugeicons/core-free-icons/Menu09Icon";
import { createSignal, onSettled, Show } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../registry/ui/dropdown-menu";
import { HugeIcon } from "../huge-icon";

function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");

  try {
    localStorage.setItem("shadcn-solid2-theme", dark ? "dark" : "light");
  } catch {
    /* The current tab still updates when storage is unavailable. */
  }
}

export function DesignerMenu(props: {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  shuffle: () => void;
  shareUrl: string;
  onNavigate?: () => void;
  onOpenPreset?: () => void;
}) {
  const [isMac, setIsMac] = createSignal(false);

  const shortcuts = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          event.target.closest('[role="menu"]')))
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    if (event.metaKey || event.ctrlKey) {
      if (key === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          props.redo();
        } else {
          props.undo();
        }
      } else if (key === "p" && props.onNavigate) {
        event.preventDefault();
        props.onNavigate();
      }

      return;
    }

    switch (key) {
      case "r": {
        event.preventDefault();

        if (event.shiftKey) {
          props.reset();
        } else {
          props.shuffle();
        }

        break;
      }

      case "d": {
        event.preventDefault();
        toggleTheme();
        break;
      }

      case "o": {
        if (props.onOpenPreset) {
          event.preventDefault();
          props.onOpenPreset();
        }

        break;
      }

      default: {
        break;
      }
    }
  };

  onSettled(() => {
    setIsMac(
      /Mac|iPhone|iPad|iPod/u.test(navigator.platform || navigator.userAgent)
    );

    document.addEventListener("keydown", shortcuts);

    return () => {
      document.removeEventListener("keydown", shortcuts);
    };
  });

  return (
    <DropdownMenuTrigger>
      <Button variant="outline" class="designer-customizer-heading">
        <span>Menu</span>
        <HugeIcon icon={Menu09Icon} size={20} />
      </Button>
      <DropdownMenu
        class="designer-main-menu"
        placement="right top"
        offset={20}
        crossOffset={-8}
      >
        <DropdownMenuGroup>
          <Show when={props.onNavigate}>
            <DropdownMenuItem
              id="navigate"
              onAction={() => props.onNavigate?.()}
            >
              Navigate...{" "}
              <DropdownMenuShortcut>
                {isMac() ? "⌘P" : "Ctrl+P"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Show>
          <Show when={props.onOpenPreset}>
            <DropdownMenuItem
              id="open-preset"
              onAction={() => props.onOpenPreset?.()}
            >
              Open Preset... <DropdownMenuShortcut>O</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Show>
          <DropdownMenuItem id="shuffle" onAction={props.shuffle}>
            Shuffle <DropdownMenuShortcut>R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem id="theme" onAction={toggleTheme}>
            Light/Dark <DropdownMenuShortcut>D</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            id="undo"
            isDisabled={!props.canUndo}
            onAction={props.undo}
          >
            Undo{" "}
            <DropdownMenuShortcut>
              {isMac() ? "⌘Z" : "Ctrl+Z"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            id="redo"
            isDisabled={!props.canRedo}
            onAction={props.redo}
          >
            Redo{" "}
            <DropdownMenuShortcut>
              {isMac() ? "⇧⌘Z" : "Ctrl+Shift+Z"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem id="reset" onAction={props.reset}>
            Reset <DropdownMenuShortcut>⇧R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <Show when={!props.onNavigate}>
            <DropdownMenuItem
              id="share"
              onAction={() => {
                void navigator.clipboard.writeText(props.shareUrl);
              }}
            >
              Copy link
            </DropdownMenuItem>
          </Show>
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}
