/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/pagination.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { LinkButton } from "./button";

function Pagination(props: ComponentProps<"nav">) {
  const rest = omit(props, "class");

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      class={cn("mx-auto flex w-full justify-center", props.class)}
      {...rest}
    />
  );
}

function PaginationContent(props: ComponentProps<"ul">) {
  const rest = omit(props, "class");

  return (
    <ul
      data-slot="pagination-content"
      class={cn("flex items-center gap-0.5", props.class)}
      {...rest}
    />
  );
}

function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Omit<ComponentProps<typeof LinkButton>, "variant">;

function PaginationLink(props: PaginationLinkProps) {
  const merged = merge({ size: "icon" } as const, props);
  const rest = omit(merged, "class", "isActive", "size");

  return (
    <LinkButton
      variant={(merged.isActive ?? false) ? "outline" : "ghost"}
      size={merged.size}
      class={cn("", merged.class)}
      aria-current={(merged.isActive ?? false) ? "page" : undefined}
      data-slot="pagination-link"
      data-active={merged.isActive}
      {...rest}
    />
  );
}

function PaginationPrevious(
  props: ComponentProps<typeof PaginationLink> & {
    text?: string;
  }
) {
  const merged = merge({ text: "Previous" } as const, props);
  const rest = omit(merged, "class", "text");

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      class={cn("pl-1.5!", merged.class)}
      {...rest}
    >
      <ChevronLeftIcon data-icon="inline-start" class="rtl:rotate-180" />
      <span class="hidden sm:block">{merged.text}</span>
    </PaginationLink>
  );
}

function PaginationNext(
  props: ComponentProps<typeof PaginationLink> & {
    text?: string;
  }
) {
  const merged = merge({ text: "Next" } as const, props);
  const rest = omit(merged, "class", "text");

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      class={cn("pr-1.5!", merged.class)}
      {...rest}
    >
      <span class="hidden sm:block">{merged.text}</span>
      <ChevronRightIcon data-icon="inline-end" class="rtl:rotate-180" />
    </PaginationLink>
  );
}

function PaginationEllipsis(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      class={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    >
      <MoreHorizontalIcon />
      <span class="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
