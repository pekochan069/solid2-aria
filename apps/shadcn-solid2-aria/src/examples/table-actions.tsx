/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/table-actions.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MoreHorizontalIcon } from "@lucide/solid";

import { Button } from "../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../registry/ui/table";

export function TableActions() {
  return (
    <Table aria-label="Products">
      <TableHeader>
        <TableHead isRowHeader>Product</TableHead>
        <TableHead>Price</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell class="font-medium">Wireless Mouse</TableCell>
          <TableCell>$29.99</TableCell>
          <TableCell class="text-right">
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontalIcon />
                <span class="sr-only">Open menu</span>
              </Button>
              <DropdownMenu placement="bottom end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell class="font-medium">Mechanical Keyboard</TableCell>
          <TableCell>$129.99</TableCell>
          <TableCell class="text-right">
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontalIcon />
                <span class="sr-only">Open menu</span>
              </Button>
              <DropdownMenu placement="bottom end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell class="font-medium">USB-C Hub</TableCell>
          <TableCell>$49.99</TableCell>
          <TableCell class="text-right">
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontalIcon />
                <span class="sr-only">Open menu</span>
              </Button>
              <DropdownMenu placement="bottom end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default TableActions;
