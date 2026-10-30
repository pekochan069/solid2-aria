/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/media-library/components/asset-grid.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  CheckIcon,
  FileTextIcon,
  ImageIcon,
  SearchIcon,
  VideoIcon,
} from "@lucide/solid";
import { cn } from "cn";
import { Switch, Match, createSignal, For } from "solid-js";

import { Badge } from "../../../../../registry/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../../../registry/ui/card";
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
import { ASSETS } from "../data";
import type { Asset, AssetType } from "../data";

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

export function AssetGrid(props: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
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
      <CardContent>
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          <For
            each={ASSETS.filter((asset) =>
              `${asset.name} ${asset.tags.join(" ")}`
                .toLowerCase()
                .includes(query().toLowerCase())
            )}
          >
            {(asset) => (
              <AssetGridItem
                asset={asset}
                selected={asset.id === props.selectedId}
                onSelect={() => {
                  props.onSelect(asset.id);
                }}
              />
            )}
          </For>
        </div>
      </CardContent>
      <CardFooter class="justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
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
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}

function AssetGridItem(props: {
  asset: Asset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        props.onSelect();
      }}
      aria-pressed={props.selected ? "true" : "false"}
      class="group focus-visible:[&>div:first-child]:ring-ring flex flex-col gap-2.5 text-left outline-none focus-visible:[&>div:first-child]:ring-2"
    >
      <div
        class={cn(
          "bg-muted/60 ring-border/70 group-hover:ring-foreground/40 relative flex aspect-4/3 items-center justify-center ring-1 transition-shadow ring-inset",
          props.selected && "ring-foreground group-hover:ring-foreground ring-2"
        )}
      >
        {props.selected ? (
          <div class="bg-foreground text-background absolute top-2 left-2 flex size-5 items-center justify-center">
            <CheckIcon class="size-3" />
          </div>
        ) : null}
        <Badge
          variant="outline"
          class="bg-background absolute top-2 right-2 border px-2 py-1 text-[0.625rem]"
        >
          {props.asset.type}
        </Badge>
        {(props.asset.duration ?? "") === "" ? null : (
          <Badge class="bg-foreground text-background absolute bottom-2 left-2 px-2 py-1">
            {props.asset.duration}
          </Badge>
        )}
        <AssetTypeIcon
          type={props.asset.type}
          class="text-muted-foreground/60 size-7"
        />
      </div>
      <div class="flex flex-col gap-0.5 px-0.5">
        <p class="line-clamp-1 text-sm font-medium">{props.asset.name}</p>
        <p class="text-muted-foreground text-[0.625rem] font-semibold tracking-wider uppercase">
          {props.asset.date} · {props.asset.size}
        </p>
      </div>
    </button>
  );
}
