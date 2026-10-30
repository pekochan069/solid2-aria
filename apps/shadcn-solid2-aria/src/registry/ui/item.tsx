/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/item.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, Lucide icons, and Dynamic rendering of native or linked items.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Link as LinkPrimitive } from "@solid2-aria/components";
import type { LinkProps } from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { Separator } from "./separator";

function ItemGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      role="list"
      data-slot="item-group"
      class={cn(
        "cn-item-group group/item-group flex w-full flex-col",
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
      class={cn("cn-item-separator", props.class)}
      {...rest}
    />
  );
}

const itemVariants = cva(
  "cn-item group/item focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:ring-[3px] [a]:transition-colors",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "cn-item-size-default",
        sm: "cn-item-size-sm",
        xs: "cn-item-size-xs",
      },
      variant: {
        default: "cn-item-variant-default",
        muted: "cn-item-variant-muted",
        outline: "cn-item-variant-outline",
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

  const ItemElement = dynamic(() => ("href" in rest ? LinkPrimitive : "div"));

  return (
    <ItemElement
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
  "cn-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "cn-item-media-variant-default",
        icon: "cn-item-media-variant-icon",
        image: "cn-item-media-variant-image",
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
        "cn-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none",
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
        "cn-item-title line-clamp-1 flex w-fit items-center",
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
        "cn-item-description [&>a:hover]:text-primary line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4",
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
      class={cn("cn-item-actions flex items-center", props.class)}
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
        "cn-item-header flex basis-full items-center justify-between",
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
        "cn-item-footer flex basis-full items-center justify-between",
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
