/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/item.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Link as LinkPrimitive } from "@solid2-aria/components";
import type { LinkProps } from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

import { Separator } from "./separator";

function ItemGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      role="list"
      data-slot="item-group"
      class={cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        props.class
      )}
      {...rest}
    />
  );
}

function ItemSeparator(props: ComponentProps<typeof Separator>) {
  const rest = omit(props, "class");

  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      class={cn("my-2", props.class)}
      {...rest}
    />
  );
}

const itemVariants = cva(
  "[a]:hover:bg-muted group/item focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:ring-[3px] [a]:transition-colors",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
      variant: {
        default: "border-transparent",
        muted: "bg-muted/50 border-transparent",
        outline: "border-border",
      },
    },
  }
);

function Item(
  props: Omit<LinkProps, "children"> &
    JSX.IntrinsicElements["div"] &
    VariantProps<typeof itemVariants>
) {
  const merged = merge({ size: "default", variant: "default" } as const, props);

  const rest = omit(merged, "class", "variant", "size");
  const Element = "href" in rest ? LinkPrimitive : "div";

  return (
    <Element
      data-slot="item"
      data-variant={merged.variant}
      data-size={merged.size}
      class={cn(
        itemVariants({
          class: merged.class,
          size: merged.size,
          variant: merged.variant,
        })
      )}
      {...rest}
    />
  );
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
  }
);

function ItemMedia(
  props: ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "variant");

  return (
    <div
      data-slot="item-media"
      data-variant={merged.variant}
      class={cn(
        itemMediaVariants({ class: merged.class, variant: merged.variant })
      )}
      {...rest}
    />
  );
}

function ItemContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="item-content"
      class={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        props.class
      )}
      {...rest}
    />
  );
}

function ItemTitle(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="item-title"
      class={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        props.class
      )}
      {...rest}
    />
  );
}

function ItemDescription(props: ComponentProps<"p">) {
  const rest = omit(props, "class");

  return (
    <p
      data-slot="item-description"
      class={cn(
        "text-muted-foreground [&>a:hover]:text-primary line-clamp-2 text-left text-sm leading-normal font-normal group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4",
        props.class
      )}
      {...rest}
    />
  );
}

function ItemActions(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="item-actions"
      class={cn("flex items-center gap-2", props.class)}
      {...rest}
    />
  );
}

function ItemHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="item-header"
      class={cn(
        "flex basis-full items-center justify-between gap-2",
        props.class
      )}
      {...rest}
    />
  );
}

function ItemFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="item-footer"
      class={cn(
        "flex basis-full items-center justify-between gap-2",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
