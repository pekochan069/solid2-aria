/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/input-group.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Group } from "@solid2-aria/components";
import type { GroupProps } from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

function InputGroup(props: GroupProps) {
  const rest = omit(props, "class");

  return (
    <Group
      data-slot="input-group"
      class={cn(
        "group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
        props.class
      )}
      {...rest}
    />
  );
}

const inputGroupAddonVariants = cva(
  "cn-input-group-addon flex cursor-text items-center justify-center select-none",
  {
    defaultVariants: {
      align: "inline-start",
    },
    variants: {
      align: {
        "block-end":
          "cn-input-group-addon-align-block-end order-last w-full justify-start",
        "block-start":
          "cn-input-group-addon-align-block-start order-first w-full justify-start",
        "inline-end": "cn-input-group-addon-align-inline-end order-last",
        "inline-start": "cn-input-group-addon-align-inline-start order-first",
      },
    },
  }
);

function InputGroupAddon(
  props: ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>
) {
  const merged = merge({ align: "inline-start" } as const, props);
  const rest = omit(merged, "class", "align");

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={merged.align}
      class={cn(inputGroupAddonVariants({ align: merged.align }), merged.class)}
      onClick={(e) => {
        if (e.target instanceof Element && e.target.closest("button")) {
          return;
        }

        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...rest}
    />
  );
}

const inputGroupButtonVariants = cva(
  "cn-input-group-button flex items-center shadow-none",
  {
    defaultVariants: {
      size: "xs",
    },
    variants: {
      size: {
        "icon-sm": "cn-input-group-button-size-icon-sm",
        "icon-xs": "cn-input-group-button-size-icon-xs",
        sm: "cn-input-group-button-size-sm",
        xs: "cn-input-group-button-size-xs",
      },
    },
  }
);

function InputGroupButton(
  props: Omit<ComponentProps<typeof Button>, "size" | "type"> &
    VariantProps<typeof inputGroupButtonVariants> & {
      type?: "button" | "submit" | "reset";
    }
) {
  const merged = merge(
    { size: "xs", type: "button", variant: "ghost" } as const,
    props
  );

  const rest = omit(merged, "class", "type", "variant", "size");

  return (
    <Button
      type={merged.type}
      data-size={merged.size}
      variant={merged.variant}
      class={cn(inputGroupButtonVariants({ size: merged.size }), merged.class)}
      {...rest}
    />
  );
}

function InputGroupText(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      class={cn(
        "cn-input-group-text flex items-center [&_svg]:pointer-events-none",
        props.class
      )}
      {...rest}
    />
  );
}

function InputGroupInput(props: ComponentProps<"input">) {
  const rest = omit(props, "class");

  return (
    <Input
      data-slot="input-group-control"
      class={cn("cn-input-group-input flex-1", props.class)}
      {...rest}
    />
  );
}

function InputGroupTextarea(props: ComponentProps<"textarea">) {
  const rest = omit(props, "class");

  return (
    <Textarea
      data-slot="input-group-control"
      class={cn("cn-input-group-textarea flex-1 resize-none", props.class)}
      {...rest}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
