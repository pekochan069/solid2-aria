/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/badge.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Show, merge, omit } from "solid-js";

const badgeVariants = cva(
  "cn-badge group/badge focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:ring-[3px] [&>svg]:pointer-events-none",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "cn-badge-variant-default",
        destructive: "cn-badge-variant-destructive",
        ghost: "cn-badge-variant-ghost",
        link: "cn-badge-variant-link",
        outline: "cn-badge-variant-outline",
        secondary: "cn-badge-variant-secondary",
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
