/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/weekly-fitness-summary.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";

const FITNESS_WEEKLY_LOAD = [
  { day: "M", load: 84 },
  { day: "T", load: 52 },
  { day: "W", load: 73 },
  { day: "T", load: 66 },
  { day: "F", load: 91 },
  { day: "S", load: 48 },
  { day: "S", load: 61 },
];

export function WeeklyFitnessSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Fitness Summary</CardTitle>
        <CardDescription>Calories and workout load by day</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="grid grid-cols-7 gap-1.5">
          {
            <For each={FITNESS_WEEKLY_LOAD}>
              {(day, _index) => (
                <div class="ring-border rounded-md p-1.5 text-center ring">
                  <div class="text-muted-foreground text-sm">{day.day}</div>
                  <div class="bg-muted relative mt-1 h-16 overflow-hidden rounded-sm">
                    <div
                      class="bg-chart-3 absolute inset-x-0 bottom-0 rounded-sm"
                      style={{
                        height: `${day.load}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </For>
          }
        </div>
      </CardContent>
      <CardFooter>
        <Button class="w-full">View details</Button>
      </CardFooter>
    </Card>
  );
}

export default WeeklyFitnessSummary;
