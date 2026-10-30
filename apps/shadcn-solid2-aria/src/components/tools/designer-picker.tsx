/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(create)/components/{picker,lock-button,style-picker,theme-picker}.tsx.
 * Modified for Solid Aria: native Solid 2 picker triggers, Solid Aria radio menus, transient hover/focus previews, and configuration locks.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import SquareLock01Icon from "@hugeicons/core-free-icons/SquareLock01Icon";
import SquareUnlock01Icon from "@hugeicons/core-free-icons/SquareUnlock01Icon";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../registry/ui/dropdown-menu";
import { HugeIcon } from "../huge-icon";

export interface DesignerPickerOption {
  label: string;
  value: string;
  separator?: boolean;
}

export function DesignerPicker(props: {
  label: string;
  value: string;
  options: readonly DesignerPickerOption[];
  onChange?: (value: string) => void;
  onPreview?: (value?: string) => void;
  icon?: JSX.Element;
  mobile: boolean;
  isDisabled?: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}) {
  return (
    <div class="designer-picker">
      <DropdownMenuTrigger
        onOpenChange={(open) => {
          if (!open) {
            props.onPreview?.();
          }
        }}
      >
        <Button
          variant="ghost"
          class="designer-picker-trigger"
          aria-label={props.label}
          isDisabled={props.isDisabled}
        >
          <span class="designer-picker-text">
            <span class="designer-picker-label">{props.label}</span>
            <span class="designer-picker-value">
              {
                props.options.find((option) => option.value === props.value)
                  ?.label
              }
            </span>
          </span>
          <span class="designer-picker-icon" aria-hidden="true">
            {props.icon}
          </span>
        </Button>
        <DropdownMenu
          class="designer-picker-menu"
          placement={props.mobile ? "top" : "right top"}
          offset={20}
          shouldCloseOnSelect={props.mobile}
          onMouseLeave={() => {
            props.onPreview?.();
          }}
        >
          <DropdownMenuGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[props.value]}
            onSelectionChange={(keys) => {
              if (keys !== "all") {
                const [key] = keys;

                if (typeof key === "string") {
                  props.onChange?.(key);
                  props.onPreview?.();
                }
              }
            }}
          >
            <For each={props.options}>
              {(option) => (
                <>
                  <Show when={option.separator}>
                    <DropdownMenuSeparator />
                  </Show>
                  <DropdownMenuItem
                    id={option.value}
                    textValue={option.label}
                    onMouseMove={() => {
                      if (!props.mobile) {
                        props.onPreview?.(option.value);
                      }
                    }}
                    onFocus={() => {
                      if (!props.mobile) {
                        props.onPreview?.(option.value);
                      }
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                </>
              )}
            </For>
          </DropdownMenuGroup>
        </DropdownMenu>
      </DropdownMenuTrigger>
      <Show when={props.onToggleLock && props.isDisabled !== true}>
        <button
          type="button"
          class="designer-picker-lock"
          data-locked={props.isLocked === true ? "true" : undefined}
          aria-label={`${props.isLocked === true ? "Unlock" : "Lock"} ${props.label}`}
          aria-pressed={props.isLocked === true ? "true" : "false"}
          title={props.isLocked === true ? "Unlock" : "Lock"}
          onClick={() => {
            props.onToggleLock?.();
          }}
        >
          <HugeIcon
            icon={
              props.isLocked === true ? SquareLock01Icon : SquareUnlock01Icon
            }
            size={20}
          />
        </button>
      </Show>
    </div>
  );
}
