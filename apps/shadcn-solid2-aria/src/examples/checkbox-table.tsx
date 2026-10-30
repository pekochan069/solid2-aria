/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/checkbox-table.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Checkbox } from "../registry/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../registry/ui/table";

const tableData = [
  {
    email: "sarah.chen@example.com",
    id: "1",
    name: "Sarah Chen",
    role: "Admin",
  },
  {
    email: "marcus.rodriguez@example.com",
    id: "2",
    name: "Marcus Rodriguez",
    role: "User",
  },
  {
    email: "priya.patel@example.com",
    id: "3",
    name: "Priya Patel",
    role: "User",
  },
  {
    email: "david.kim@example.com",
    id: "4",
    name: "David Kim",
    role: "Editor",
  },
];

export function CheckboxInTable() {
  return (
    <Table aria-label="Users" selectionMode="multiple">
      <TableHeader>
        <TableHead class="w-8">
          <Checkbox
            id="select-all-checkbox"
            name="select-all-checkbox"
            slot="selection"
          />
        </TableHead>
        <TableHead isRowHeader>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
      </TableHeader>
      <TableBody>
        {
          <For each={tableData}>
            {(row) => (
              <TableRow>
                <TableCell>
                  <Checkbox
                    id={`row-${row.id}-checkbox`}
                    name={`row-${row.id}-checkbox`}
                    slot="selection"
                  />
                </TableCell>
                <TableCell class="font-medium">{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            )}
          </For>
        }
      </TableBody>
    </Table>
  );
}

export default CheckboxInTable;
