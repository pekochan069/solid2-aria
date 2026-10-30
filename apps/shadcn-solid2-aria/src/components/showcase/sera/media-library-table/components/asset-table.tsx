/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/media-library-table/components/asset-table.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  FileTextIcon,
  ImageIcon,
  MoreVerticalIcon,
  SearchIcon,
  VideoIcon,
} from "@lucide/solid";
import { Switch, Match, createSignal, For } from "solid-js";

import { Badge } from "../../../../../registry/ui/badge";
import { Button } from "../../../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../../../registry/ui/card";
import { Checkbox } from "../../../../../registry/ui/checkbox";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "../../../../../registry/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../../../../registry/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../../../registry/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../registry/ui/table";
import { ASSETS } from "../../media-library/data";
import type { AssetType } from "../../media-library/data";

function AssetTypeIcon(props: { type: AssetType; class?: string }) {
  return (
    <Switch fallback={<ImageIcon class={props.class} />}>
      <Match when={props.type === "MP4"}>
        {<VideoIcon class={props.class} />}
      </Match>
      <Match when={props.type === "PDF"}>
        {<FileTextIcon class={props.class} />}
      </Match>
    </Switch>
  );
}

export function AssetTable() {
  const [selectedIds, setSelectedIds] = createSignal<Set<string>>(
    new Set(["1"])
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const [query, setQuery] = createSignal("");

  return (
    <Card>
      <CardHeader>
        <InputGroup class="w-full">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search files"
            value={query()}
            onInput={(event) => {
              setQuery(event.currentTarget.value);
            }}
            placeholder="Search files, tags, or metadata..."
          />
        </InputGroup>
      </CardHeader>
      <CardContent class="px-0 py-0">
        <Table aria-label="Media assets">
          <TableHeader>
            <TableHead class="w-10 pl-6" aria-label="Select" id="column-6" />
            <TableHead class="w-20" aria-label="Preview" id="column-7" />
            <TableHead isRowHeader id="column-0">
              Filename
            </TableHead>
            <TableHead id="column-1">Type</TableHead>
            <TableHead id="column-2">Dimensions</TableHead>
            <TableHead id="column-3">Size</TableHead>
            <TableHead id="column-4">Uploaded By</TableHead>
            <TableHead id="column-5">Date</TableHead>
            <TableHead class="w-10 pr-6" aria-label="Actions" id="column-8" />
          </TableHeader>
          <TableBody>
            <For
              each={ASSETS.filter((asset) =>
                `${asset.name} ${asset.tags.join(" ")}`
                  .toLowerCase()
                  .includes(query().toLowerCase())
              )}
            >
              {(asset) => {
                const isSelected = () => selectedIds().has(asset.id);

                return (
                  <TableRow
                    id={asset.id}

                    data-selected={isSelected() || undefined}
                    class="cursor-pointer"
                    onPress={() => {
                      toggleSelection(asset.id);
                    }}
                  >
                    <TableCell class="pl-6">
                      <Checkbox
                        isSelected={isSelected()}
                        aria-label={`Select ${asset.name}`}
                        onChange={() => {
                          toggleSelection(asset.id);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div class="bg-muted/60 ring-border/70 relative flex aspect-4/3 w-16 items-center justify-center ring-1 ring-inset">
                        {(asset.duration ?? "") === "" ? null : (
                          <span class="bg-foreground/90 text-background absolute right-1 bottom-1 px-1 text-[0.5rem] font-semibold tracking-wider">
                            {asset.duration}
                          </span>
                        )}
                        <AssetTypeIcon
                          type={asset.type}
                          class="text-muted-foreground/60 size-4"
                        />
                      </div>
                    </TableCell>
                    <TableCell class="text-foreground text-sm font-medium">
                      {asset.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        class="border px-2 py-0.5 text-[0.625rem]"
                      >
                        {asset.type}
                      </Badge>
                    </TableCell>
                    <TableCell class="text-sm">{asset.dimensions}</TableCell>
                    <TableCell class="text-sm">{asset.size}</TableCell>
                    <TableCell>{asset.uploadedBy}</TableCell>
                    <TableCell class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      {asset.date}
                    </TableCell>
                    <TableCell class="pr-6 text-right">
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Open actions for ${asset.name}`}
                        >
                          <MoreVerticalIcon />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuItem>Preview</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </DropdownMenuTrigger>
                    </TableCell>
                  </TableRow>
                );
              }}
            </For>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter class="justify-center py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" text="" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" text="" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
