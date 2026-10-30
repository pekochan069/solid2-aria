/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/bubble.tsx.
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

function BubbleGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="bubble-group"
      class={cn("flex min-w-0 flex-col gap-2", props.class)}
      {...rest}
    />
  );
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive/10 dark:*:data-[slot=bubble-content]:bg-destructive/20 *:data-[slot=bubble-content]:text-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30",
        ghost:
          "[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50 border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0",
        muted:
          "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
        outline:
          "*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-border [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        tinted:
          "*:data-[slot=bubble-content]:text-foreground *:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
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
            "[button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-ring/50 w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:ring-3",
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
            "[button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-ring/50 w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:ring-3",
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
  "ring-card bg-muted absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-sm ring-3 has-[button]:p-0",
  {
    defaultVariants: {
      align: "end",
      side: "bottom",
    },
    variants: {
      align: {
        end: "right-3",
        start: "left-3",
      },
      side: {
        bottom: "bottom-0 translate-y-3/4",
        top: "top-0 -translate-y-3/4",
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
