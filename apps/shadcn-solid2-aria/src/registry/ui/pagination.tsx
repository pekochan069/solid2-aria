/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/pagination.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
import { LinkButton } from "./button";

function Pagination(props: ComponentProps<"nav">) {
  const rest = omit(props, "class");

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      class={cn(
        "cn-pagination mx-auto flex w-full justify-center",
        props.class
      )}
      {...rest}
    />
  );
}

function PaginationContent(props: ComponentProps<"ul">) {
  const rest = omit(props, "class");

  return (
    <ul
      data-slot="pagination-content"
      class={cn("cn-pagination-content flex items-center", props.class)}
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
      class={cn("cn-pagination-link", merged.class)}
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
      class={cn("cn-pagination-previous", merged.class)}
      {...rest}
    >
      <IconPlaceholder
        lucide="ChevronLeftIcon"
        tabler="IconChevronLeft"
        hugeicons="ArrowLeft01Icon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        data-icon="inline-start"
        class="cn-rtl-flip"
      />
      <span class="cn-pagination-previous-text hidden sm:block">
        {merged.text}
      </span>
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
      class={cn("cn-pagination-next", merged.class)}
      {...rest}
    >
      <span class="cn-pagination-next-text hidden sm:block">{merged.text}</span>
      <IconPlaceholder
        lucide="ChevronRightIcon"
        tabler="IconChevronRight"
        hugeicons="ArrowRight01Icon"
        phosphor="CaretRightIcon"
        remixicon="RiArrowRightSLine"
        data-icon="inline-end"
        class="cn-rtl-flip"
      />
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
        "cn-pagination-ellipsis flex items-center justify-center",
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
