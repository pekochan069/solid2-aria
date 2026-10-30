/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/breadcrumb.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronRightIcon, MoreHorizontalIcon } from "@lucide/solid";
import {
  Breadcrumb as BreadcrumbPrimitive,
  Breadcrumbs as BreadcrumbsPrimitive,
  composeRenderProps,
  Link as LinkPrimitive,
} from "@solid2-aria/components";
import type {
  BreadcrumbProps,
  BreadcrumbsProps,
  LinkProps,
} from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

function Breadcrumb(props: ComponentProps<"nav">) {
  const rest = omit(props, "class");

  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      class={cn("", props.class)}
      {...rest}
    />
  );
}

function BreadcrumbList<T extends object>(props: BreadcrumbsProps<T>) {
  const rest = omit(props, "class");

  return (
    <BreadcrumbsPrimitive
      data-slot="breadcrumb-list"
      class={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word",
        props.class
      )}
      {...rest}
    />
  );
}

function BreadcrumbItem(
  props: BreadcrumbProps & {
    separatorClassName?: string;
  }
) {
  const rest = omit(props, "class", "children", "separatorClassName");

  return (
    <BreadcrumbPrimitive
      data-slot="breadcrumb-item"
      class={cn("inline-flex items-center gap-1", props.class)}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps0) => (
        <>
          {children}
          {!renderProps0.isCurrent && (
            <span
              data-slot="breadcrumb-separator"
              role="presentation"
              aria-hidden="true"
              class={cn("[&>svg]:size-3.5", props.separatorClassName)}
            >
              <ChevronRightIcon class="rtl:rotate-180" />
            </span>
          )}
        </>
      ))}
    </BreadcrumbPrimitive>
  );
}

function BreadcrumbLink(props: LinkProps) {
  const rest = omit(props, "class", "render");

  return (
    <LinkPrimitive
      data-slot="breadcrumb-link"
      class={cn("hover:text-foreground transition-colors", props.class)}
      render={props.render}
      {...rest}
    />
  );
}

function BreadcrumbPage(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={cn("text-foreground font-normal", props.class)}
      {...rest}
    />
  );
}

function BreadcrumbEllipsis(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      class={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        props.class
      )}
      {...rest}
    >
      <MoreHorizontalIcon />
      <span class="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbEllipsis,
};
