/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/audience-analytics/components/top-editorial.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowDownIcon, MoreHorizontalIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { createSignal, For } from "solid-js";

import { Button } from "../../../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../../registry/ui/card";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "../../../../../registry/ui/dropdown-menu";
import { Spinner } from "../../../../../registry/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../registry/ui/table";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../../../registry/ui/toggle-group";

type EditorialMetric = "views" | "time" | "shares";

interface EditorialRow {
  rank: number;
  title: string;
  author: string;
  published: string;
  pageviews: string;
  avgTime: string;
}

const METRIC_LABEL: Record<EditorialMetric, string> = {
  shares: "SHARES",
  time: "TIME",
  views: "VIEWS",
};

const EDITORIAL_ROWS: EditorialRow[] = [
  {
    author: "Elena Rostova",
    avgTime: "04:15",
    pageviews: "45.2k",
    published: "Oct 12",
    rank: 1,
    title: "The New Vanguard of Minimalist Architecture",
  },
  {
    author: "Julian Vance",
    avgTime: "03:42",
    pageviews: "38.9k",
    published: "Oct 05",
    rank: 2,
    title: "Autumn Sartorial Code: Deconstructed Classics",
  },
  {
    author: "Marcus Trent",
    avgTime: "06:20",
    pageviews: "31.4k",
    published: "Sep 28",
    rank: 3,
    title: "Interview: Director Sofia Coppola on The Aesthetics of Isolation",
  },
  {
    author: "Sarah Lin",
    avgTime: "02:55",
    pageviews: "22.1k",
    published: "Oct 18",
    rank: 4,
    title: "Sourcing Ceramics from Kyoto's Oldest Kilns",
  },
  {
    author: "Noah Bennett",
    avgTime: "03:18",
    pageviews: "19.7k",
    published: "Oct 21",
    rank: 5,
    title: "Field Notes from Copenhagen Design Week",
  },
  {
    author: "Claire Duval",
    avgTime: "04:02",
    pageviews: "17.4k",
    published: "Oct 09",
    rank: 6,
    title: "A Studio Visit with Milan's Most Elusive Lighting Designer",
  },
  {
    author: "Tommy Rhodes",
    avgTime: "03:36",
    pageviews: "15.9k",
    published: "Sep 30",
    rank: 7,
    title: "Collecting the New Avant-Garde in Contemporary Furniture",
  },
  {
    author: "Amara Iqbal",
    avgTime: "05:08",
    pageviews: "14.2k",
    published: "Oct 14",
    rank: 8,
    title: "Inside Lisbon's Quiet Culinary Renaissance",
  },
  {
    author: "Henry Vale",
    avgTime: "03:11",
    pageviews: "12.7k",
    published: "Oct 03",
    rank: 9,
    title: "Why Slow Interiors Are Defining the Next Luxury Wave",
  },
  {
    author: "Mina Okafor",
    avgTime: "02:49",
    pageviews: "11.3k",
    published: "Sep 26",
    rank: 10,
    title: "The Return of Print: Independent Magazine Covers to Watch",
  },
];

type TopEditorialProps = ComponentProps<typeof Card> & {
  selectedMetric?: EditorialMetric;
};

export function TopEditorial(props: TopEditorialProps) {
  const [visibleCount, setVisibleCount] = createSignal(5);
  const [isLoadingMore, setIsLoadingMore] = createSignal(false);
  const hasMoreRows = () => visibleCount() < EDITORIAL_ROWS.length;
  const visibleRows = () => EDITORIAL_ROWS.slice(0, visibleCount());

  const handleLoadMore = () => {
    if (!hasMoreRows() || isLoadingMore()) {
      return;
    }

    setIsLoadingMore(true);

    window.setTimeout(() => {
      setVisibleCount(EDITORIAL_ROWS.length);
      setIsLoadingMore(false);
    }, 2000);
  };

  return (
    <Card {...props}>
      <CardHeader>
        <div class="flex flex-col gap-(--gap) sm:flex-row">
          <div class="flex flex-col gap-1.5">
            <CardTitle class="text-2xl">Top Editorials</CardTitle>
            <CardDescription>Ranked by engagement</CardDescription>
          </div>
          <ToggleGroup
            aria-label="Top editorials metric selector"
            selectionMode="single"
            selectedKeys={[props.selectedMetric ?? "views"]}
            variant="outline"
            class="w-full sm:ml-auto sm:w-fit"
          >
            <For each={["views", "time", "shares"] as const}>
              {(metric) => (
                <ToggleGroupItem id={metric} class="flex-1">
                  {METRIC_LABEL[metric]}
                </ToggleGroupItem>
              )}
            </For>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent class="**:data-[slot=table-container]:no-scrollbar flex-1 **:data-[slot=table-container]:overflow-y-hidden">
        <Table aria-label="Top editorials">
          <TableHeader>
            <TableHead id="column-0">#</TableHead>
            <TableHead isRowHeader id="column-1">
              Title
            </TableHead>
            <TableHead id="column-2">Published</TableHead>
            <TableHead id="column-3">Page Views</TableHead>
            <TableHead id="column-4">Read Time</TableHead>
            <TableHead class="text-right" id="column-5">
              Actions
            </TableHead>
          </TableHeader>
          <TableBody>
            <For each={visibleRows()}>
              {(row) => (
                <TableRow id={row.rank}>
                  <TableCell class="translate-y-1 align-text-top">
                    {row.rank}
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col gap-2">
                      <p class="font-heading text-foreground text-xl tracking-tight">
                        {row.title}
                      </p>
                      <p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        By {row.author}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{row.published}</TableCell>
                  <TableCell>{row.pageviews}</TableCell>
                  <TableCell>{row.avgTime}</TableCell>
                  <TableCell class="text-right">
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Open actions for ${row.title}`}
                      >
                        <MoreHorizontalIcon />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Publish</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </DropdownMenuTrigger>
                  </TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter class="justify-center">
        {hasMoreRows() ? (
          <Button
            type="button"
            variant="outline"
            onPress={handleLoadMore}
            isDisabled={isLoadingMore()}
          >
            Load more content{" "}
            {isLoadingMore() ? (
              <Spinner data-icon="inline-end" />
            ) : (
              <ArrowDownIcon data-icon="inline-end" />
            )}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
