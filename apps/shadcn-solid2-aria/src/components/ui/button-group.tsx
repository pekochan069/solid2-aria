/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/button-group.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Show, merge, omit } from "solid-js";

import { Separator } from "./separator";

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    defaultVariants: {
      orientation: "horizontal",
    },
    variants: {
      orientation: {
        horizontal:
          "**:data-slot:rounded-r-none [&_[data-slot]~[data-slot]]:rounded-l-none [&_[data-slot]~[data-slot]]:border-l-0 [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
        vertical:
          "flex-col **:data-slot:rounded-b-none [&_[data-slot]~[data-slot]]:rounded-t-none [&_[data-slot]~[data-slot]]:border-t-0 [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
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
            "bg-muted flex items-center gap-2 rounded-lg border px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
            props.class
          )}
          {...rest}
        />
      }
    >
      {(render) => {
        const renderProps = merge(() => ({
          class: cn(
            "bg-muted flex items-center gap-2 rounded-lg border px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
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
        "bg-input relative self-stretch data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto",
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
