/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/audience-analytics/components/demographics.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MoveRightIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { For } from "solid-js";

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
  Progress,
  ProgressLabel,
  ProgressValue,
} from "../../../../../registry/ui/progress";

const DEMOGRAPHIC_DATA = [
  { age: "18 - 24", percentage: 22 },
  { age: "25 - 34", percentage: 64 },
  { age: "35 - 44", percentage: 12 },
  { age: "45+", percentage: 5 },
];

export function Demographics(props: ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle class="text-2xl">Demographics</CardTitle>
        <CardDescription>Reader Profile</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-10">
        <For each={DEMOGRAPHIC_DATA}>
          {(item) => (
            <Progress value={item.percentage} aria-label={item.age}>
              <ProgressLabel>{item.age}</ProgressLabel>
              <ProgressValue>
                {(formattedValue) => formattedValue}
              </ProgressValue>
            </Progress>
          )}
        </For>
      </CardContent>
      <CardFooter>
        <Button variant="link" class="w-full">
          View all source <MoveRightIcon data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}
