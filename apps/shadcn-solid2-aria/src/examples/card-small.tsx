/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/card-small.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronRightIcon } from "@lucide/solid";

import { Button } from "../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../registry/ui/card";

export function CardSmall() {
  const featureName = "Scheduled reports";

  return (
    <Card size="sm" class="mx-auto w-full max-w-xs">
      <CardHeader>
        <CardTitle>{featureName}</CardTitle>
        <CardDescription>
          Weekly snapshots. No more manual exports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul class="grid gap-2 py-2 text-sm">
          <li class="flex gap-2">
            <ChevronRightIcon class="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>Choose a schedule (daily, or weekly).</span>
          </li>
          <li class="flex gap-2">
            <ChevronRightIcon class="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>Send to channels or specific teammates.</span>
          </li>
          <li class="flex gap-2">
            <ChevronRightIcon class="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>Include charts, tables, and key metrics.</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter class="flex-col gap-2">
        <Button size="sm" class="w-full">
          Set up scheduled reports
        </Button>
        <Button variant="outline" size="sm" class="w-full">
          See what&apos;s new
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CardSmall;
