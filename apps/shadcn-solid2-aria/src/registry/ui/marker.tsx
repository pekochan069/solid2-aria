/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/marker.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Show, merge, omit } from "solid-js";

const markerVariants = cva(
  "cn-marker group/marker relative flex w-full items-center",
  {
    variants: {
      variant: {
        border: "cn-marker-variant-border",
        default: "cn-marker-variant-default",
        separator: "cn-marker-variant-separator",
      },
    },
  }
);

function Marker(
  props: ComponentProps<"div"> &
    VariantProps<typeof markerVariants> & {
      render?: (props: JSX.IntrinsicElements["div"]) => JSX.Element;
    }
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "variant", "render", "children");

  return (
    <Show
      when={merged.render}
      fallback={
        <div
          {...rest}
          data-slot="marker"
          data-variant={merged.variant}
          class={cn(
            markerVariants({ class: merged.class, variant: merged.variant })
          )}
        >
          {merged.children}
        </div>
      }
    >
      {(render) => {
        const renderProps = merge(() => ({
          ...rest,
          children: merged.children,
          class: cn(
            markerVariants({ class: merged.class, variant: merged.variant })
          ),
          "data-slot": "marker",
          "data-variant": merged.variant ?? undefined,
        }));

        return <>{render()(renderProps)}</>;
      }}
    </Show>
  );
}

function MarkerIcon(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      class={cn("cn-marker-icon shrink-0", props.class)}
      {...rest}
    />
  );
}

function MarkerContent(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="marker-content"
      class={cn("cn-marker-content min-w-0 wrap-break-word", props.class)}
      {...rest}
    />
  );
}

export { Marker, MarkerIcon, MarkerContent, markerVariants };
