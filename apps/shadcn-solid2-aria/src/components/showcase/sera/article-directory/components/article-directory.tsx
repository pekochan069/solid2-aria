/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/article-directory/components/article-directory.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "@lucide/solid";
import { cn } from "cn";
import { createSignal, For } from "solid-js";

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
} from "../../../../../registry/ui/pagination";
import { Progress, ProgressValue } from "../../../../../registry/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../registry/ui/table";

const ARTICLE_ROWS = [
  {
    author: "Elena Rostova",
    issue: "Summer 2024",
    progress: 45,
    status: "in-revision",
    statusLabel: "In revision",
    title: "The Future of Sustainable Architecture",
    wordProgress: "1.4k / 2.6k words",
  },
  {
    author: "Marcus Chen",
    issue: "Summer 2024",
    progress: 90,
    status: "final-edit",
    statusLabel: "Final edit",
    title: "Brutalism's Second Act",
    wordProgress: "2.1k / 2.5k words",
  },
  {
    author: "Sarah Jenkins",
    issue: "Autumn 2024",
    progress: 20,
    status: "drafting",
    statusLabel: "Drafting",
    title: "The Typography of Public Spaces",
    wordProgress: "0.5k / 1.5k words",
  },
  {
    author: "David O'Connor",
    issue: "Summer 2024",
    progress: 100,
    status: "published",
    statusLabel: "Published",
    title: "Rethinking Urban Canopies",
    wordProgress: "1.8k / 1.8k words",
  },
  {
    author: "Amara Osei",
    issue: "Autumn 2024",
    progress: 55,
    status: "in-revision",
    statusLabel: "In revision",
    title: "Light, Glass, and the Modern Museum",
    wordProgress: "1.2k / 2.0k words",
  },
  {
    author: "Tomás Herrera",
    issue: "Summer 2024",
    progress: 100,
    status: "published",
    statusLabel: "Published",
    title: "Concrete Utopias: Housing in the 21st Century",
    wordProgress: "3.0k / 3.0k words",
  },
  {
    author: "Ingrid Solberg",
    issue: "Winter 2024",
    progress: 30,
    status: "drafting",
    statusLabel: "Drafting",
    title: "Designing for Silence",
    wordProgress: "0.8k / 2.2k words",
  },
  {
    author: "James Whitfield",
    issue: "Autumn 2024",
    progress: 85,
    status: "final-edit",
    statusLabel: "Final edit",
    title: "The Invisible Infrastructure of Cities",
    wordProgress: "2.4k / 2.8k words",
  },
] as const;

const STATUS_BADGE_VARIANT = {
  drafting: "ghost",
  "final-edit": "default",
  "in-revision": "outline",
  published: "secondary",
} as const;

const STATUS_DOT_CLASSNAME = {
  drafting: "bg-muted-foreground/60",
  "final-edit": "bg-foreground/90",
  "in-revision": "bg-amber-600/80",
  published: "bg-emerald-600/80",
};

export function ArticleDirectory() {
  const [query, setQuery] = createSignal("");

  return (
    <Card>
      <CardHeader>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search articles"
            value={query()}
            onInput={(event) => {
              setQuery(event.currentTarget.value);
            }}
            type="search"
            placeholder="Search articles..."
          />
        </InputGroup>
      </CardHeader>
      <CardContent>
        <Table aria-label="Article directory">
          <TableHeader>
            <TableHead isRowHeader id="column-0">
              Title
            </TableHead>
            <TableHead class="w-[170px]" id="column-1">
              Author
            </TableHead>
            <TableHead class="w-[150px]" id="column-2">
              Issue
            </TableHead>
            <TableHead class="w-[180px]" id="column-3">
              Status
            </TableHead>
            <TableHead class="w-[140px]" id="column-4">
              Progress
            </TableHead>
          </TableHeader>
          <TableBody>
            <For
              each={ARTICLE_ROWS.filter((row) =>
                row.title.toLowerCase().includes(query().toLowerCase())
              )}
            >
              {(row) => (
                <TableRow id={row.title}>
                  <TableCell>
                    <div class="flex flex-col gap-1">
                      <p class="font-heading text-foreground text-xl tracking-tight">
                        {row.title}
                      </p>
                      <p class="text-muted-foreground text-xs">
                        {row.wordProgress}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{row.author}</TableCell>
                  <TableCell>{row.issue}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[row.status]}>
                      <span
                        class={cn(
                          "size-1.5 rounded-full",
                          STATUS_DOT_CLASSNAME[row.status]
                        )}
                      />
                      {row.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Progress
                      value={row.progress}
                      aria-label={`${row.progress}% complete`}
                      class="flex flex-row-reverse items-center **:data-[slot=progress-track]:w-16"
                    >
                      <ProgressValue>
                        {(formattedValue) => formattedValue}
                      </ProgressValue>
                    </Progress>
                  </TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                size="icon-sm"
                aria-label="Previous page"
              >
                <ChevronLeftIcon class="cn-rtl-flip" />
              </PaginationLink>
            </PaginationItem>
            <For each={[1, 2, 3]}>
              {(page) => (
                <PaginationItem>
                  <PaginationLink href="#" size="icon-sm" isActive={page === 1}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )}
            </For>
            <PaginationItem>
              <PaginationLink href="#" size="icon-sm" aria-label="Next page">
                <ChevronRightIcon class="cn-rtl-flip" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
