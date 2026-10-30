/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/badge.tsx.
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

const badgeVariants = cva(
  "group/badge focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
      },
    },
  }
);

function Badge(
  props: ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & {
      render?: (props: JSX.IntrinsicElements["span"]) => JSX.Element;
    }
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "variant", "render");

  return (
    <Show
      when={merged.render}
      fallback={
        <span
          data-slot="badge"
          data-variant={merged.variant}
          class={cn(badgeVariants({ variant: merged.variant }), merged.class)}
          {...rest}
        />
      }
    >
      {(render) => {
        const renderProps = merge(() => ({
          class: cn(badgeVariants({ variant: merged.variant }), merged.class),
          "data-slot": "badge",
          "data-variant": merged.variant ?? undefined,
          ...rest,
        }));

        return <>{render()(renderProps)}</>;
      }}
    </Show>
  );
}

export { Badge, badgeVariants };
