/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/button-group.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Show, merge, omit } from "solid-js";

import { Separator } from "./separator";

const buttonGroupVariants = cva(
  "cn-button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    defaultVariants: {
      orientation: "horizontal",
    },
    variants: {
      orientation: {
        horizontal:
          "cn-button-group-orientation-horizontal **:data-slot:rounded-r-none [&_[data-slot]~[data-slot]]:rounded-l-none [&_[data-slot]~[data-slot]]:border-l-0",
        vertical:
          "cn-button-group-orientation-vertical flex-col **:data-slot:rounded-b-none [&_[data-slot]~[data-slot]]:rounded-t-none [&_[data-slot]~[data-slot]]:border-t-0",
      },
    },
  }
);

function ButtonGroup(
  props: ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>
) {
  const rest = omit(props, "class", "orientation");

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={props.orientation}
      class={cn(
        buttonGroupVariants({ orientation: props.orientation }),
        props.class
      )}
      {...rest}
    />
  );
}

function ButtonGroupText(
  props: ComponentProps<"div"> & {
    render?: (props: JSX.IntrinsicElements["div"]) => JSX.Element;
  }
) {
  const rest = omit(props, "class", "render");

  return (
    <Show
      when={props.render}
      fallback={
        <div
          data-slot="button-group-text"
          class={cn(
            "cn-button-group-text flex items-center [&_svg]:pointer-events-none",
            props.class
          )}
          {...rest}
        />
      }
    >
      {(render) => {
        const renderProps = merge(() => ({
          class: cn(
            "cn-button-group-text flex items-center [&_svg]:pointer-events-none",
            props.class
          ),
          "data-slot": "button-group-text",
          ...rest,
        }));

        return <>{render()(renderProps)}</>;
      }}
    </Show>
  );
}

function ButtonGroupSeparator(props: ComponentProps<typeof Separator>) {
  const merged = merge({ orientation: "vertical" } as const, props);
  const rest = omit(merged, "class", "orientation");

  return (
    <Separator
      data-slot="button-group-separator"
      orientation={merged.orientation}
      class={cn(
        "cn-button-group-separator relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        merged.class
      )}
      {...rest}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
