/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/table.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Cell as CellPrimitive,
  Column as ColumnPrimitive,
  Row as RowPrimitive,
  TableBody as TableBodyPrimitive,
  TableFooter as TableFooterPrimitive,
  TableHeader as TableHeaderPrimitive,
  Table as TablePrimitive,
} from "@solid2-aria/components";
import type {
  CellProps,
  ColumnProps,
  RowProps,
  TableBodyProps,
  TableFooterProps,
  TableHeaderProps,
  TableProps,
} from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

function Table(props: TableProps) {
  const rest = omit(props, "class");

  return (
    <div data-slot="table-container" class="relative w-full overflow-x-auto">
      <TablePrimitive
        data-slot="table"
        class={cn("w-full caption-bottom text-sm", props.class)}
        {...rest}
      />
    </div>
  );
}

function TableHeader<T>(props: TableHeaderProps<T>) {
  const rest = omit(props, "class");

  return (
    <TableHeaderPrimitive
      data-slot="table-header"
      class={cn("[&_tr]:border-b", props.class)}
      {...rest}
    />
  );
}

function TableBody<T>(props: TableBodyProps<T>) {
  const rest = omit(props, "class");

  return (
    <TableBodyPrimitive
      data-slot="table-body"
      class={cn(
        "data-empty:h-24 data-empty:text-center [&_tr:last-child]:border-0",
        props.class
      )}
      {...rest}
    />
  );
}

function TableFooter<T>(props: TableFooterProps<T>) {
  const rest = omit(props, "class");

  return (
    <TableFooterPrimitive
      data-slot="table-footer"
      class={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        props.class
      )}
      {...rest}
    />
  );
}

function TableRow<T>(props: RowProps<T>) {
  const rest = omit(props, "class");

  return (
    <RowPrimitive
      data-slot="table-row"
      class={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted data-[selected]:bg-muted has-aria-expanded:bg-muted/50 border-b transition-colors",
        props.class
      )}
      {...rest}
    />
  );
}

function TableHead(props: ColumnProps) {
  const rest = omit(props, "class");

  return (
    <ColumnPrimitive
      data-slot="table-head"
      class={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([data-slot=checkbox])]:pr-0 [&:has([role=checkbox])]:pr-0",
        props.class
      )}
      {...rest}
    />
  );
}

function TableCell(props: CellProps) {
  const rest = omit(props, "class");

  return (
    <CellPrimitive
      data-slot="table-cell"
      class={cn(
        "p-2 align-middle whitespace-nowrap [&:has([data-slot=checkbox])]:pr-0 [&:has([role=checkbox])]:pr-0",
        props.class
      )}
      {...rest}
    />
  );
}

function TableCaption(props: ComponentProps<"figcaption">) {
  const rest = omit(props, "class");

  return (
    <figcaption
      data-slot="table-caption"
      class={cn("text-muted-foreground mt-4 text-center text-sm", props.class)}
      {...rest}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
