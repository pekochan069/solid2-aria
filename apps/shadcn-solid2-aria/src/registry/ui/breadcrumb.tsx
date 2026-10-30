/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/breadcrumb.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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

import { IconPlaceholder } from "../lib/icon-placeholder";

function Breadcrumb(props: ComponentProps<"nav">) {
  const rest = omit(props, "class");

  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      class={cn("cn-breadcrumb", props.class)}
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
        "cn-breadcrumb-list flex flex-wrap items-center wrap-break-word",
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
      class={cn("cn-breadcrumb-item inline-flex items-center", props.class)}
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
              class={cn("cn-breadcrumb-separator", props.separatorClassName)}
            >
              <IconPlaceholder
                lucide="ChevronRightIcon"
                tabler="IconChevronRight"
                hugeicons="ArrowRight01Icon"
                phosphor="CaretRightIcon"
                remixicon="RiArrowRightSLine"
                class="cn-rtl-flip"
              />
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
      class={cn("cn-breadcrumb-link", props.class)}
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
      class={cn("cn-breadcrumb-page", props.class)}
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
        "cn-breadcrumb-ellipsis flex items-center justify-center",
        props.class
      )}
      {...rest}
    >
      <IconPlaceholder
        lucide="MoreHorizontalIcon"
        tabler="IconDots"
        hugeicons="MoreHorizontalCircle01Icon"
        phosphor="DotsThreeIcon"
        remixicon="RiMoreLine"
      />
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
