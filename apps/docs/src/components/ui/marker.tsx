/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/marker.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { Show, merge, omit } from "solid-js";

import { cn } from "#lib/cn";

const markerVariants = cva(
  "text-muted-foreground [a]:hover:text-foreground group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3",
  {
    variants: {
      variant: {
        border: "border-border border-b pb-2",
        default: "",
        separator:
          "before:bg-border after:bg-border before:mr-1 before:h-px before:min-w-0 before:flex-1 after:ml-1 after:h-px after:min-w-0 after:flex-1",
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
      class={cn(
        "size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    />
  );
}

function MarkerContent(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="marker-content"
      class={cn(
        "*:[a]:hover:text-foreground min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3",
        props.class
      )}
      {...rest}
    />
  );
}

export { Marker, MarkerIcon, MarkerContent, markerVariants };
