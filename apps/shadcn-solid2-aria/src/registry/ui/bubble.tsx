/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/bubble.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Show, merge, omit } from "solid-js";

function BubbleGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="bubble-group"
      class={cn("cn-bubble-group flex min-w-0 flex-col", props.class)}
      {...rest}
    />
  );
}

const bubbleVariants = cva(
  "cn-bubble group/bubble relative flex w-fit min-w-0 flex-col",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "cn-bubble-variant-default",
        destructive: "cn-bubble-variant-destructive",
        ghost: "cn-bubble-variant-ghost",
        muted: "cn-bubble-variant-muted",
        outline: "cn-bubble-variant-outline",
        secondary: "cn-bubble-variant-secondary",
        tinted: "cn-bubble-variant-tinted",
      },
    },
  }
);

function Bubble(
  props: ComponentProps<"div"> &
    VariantProps<typeof bubbleVariants> & {
      align?: "start" | "end";
    }
) {
  const merged = merge({ align: "start", variant: "default" } as const, props);

  const rest = omit(merged, "variant", "align", "class");

  return (
    <div
      data-slot="bubble"
      data-variant={merged.variant}
      data-align={merged.align}
      class={cn(bubbleVariants({ variant: merged.variant }), merged.class)}
      {...rest}
    />
  );
}

function BubbleContent(
  props: ComponentProps<"div"> & {
    render?: (props: JSX.IntrinsicElements["div"]) => JSX.Element;
  }
) {
  const rest = omit(props, "class", "render", "children");

  return (
    <Show
      when={props.render}
      fallback={
        <div
          {...rest}
          data-slot="bubble-content"
          class={cn(
            "cn-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors",
            props.class
          )}
        >
          {props.children}
        </div>
      }
    >
      {(render) => {
        const renderProps = merge(() => ({
          ...rest,
          children: props.children,
          class: cn(
            "cn-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors",
            props.class
          ),
          "data-slot": "bubble-content",
        }));

        return <>{render()(renderProps)}</>;
      }}
    </Show>
  );
}

const bubbleReactionsVariants = cva(
  "cn-bubble-reactions absolute z-10 flex w-fit items-center justify-center",
  {
    defaultVariants: {
      align: "end",
      side: "bottom",
    },
    variants: {
      align: {
        end: "cn-bubble-reactions-align-end",
        start: "cn-bubble-reactions-align-start",
      },
      side: {
        bottom: "cn-bubble-reactions-side-bottom",
        top: "cn-bubble-reactions-side-top",
      },
    },
  }
);

function BubbleReactions(
  props: ComponentProps<"div"> & {
    align?: "start" | "end";
    side?: "top" | "bottom";
  }
) {
  const merged = merge({ align: "end", side: "bottom" } as const, props);
  const rest = omit(merged, "side", "align", "class");

  return (
    <div
      data-slot="bubble-reactions"
      data-align={merged.align}
      data-side={merged.side}
      class={cn(
        bubbleReactionsVariants({ align: merged.align, side: merged.side }),
        merged.class
      )}
      {...rest}
    />
  );
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions };
