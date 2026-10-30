/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/empty-state/components/empty-directory.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { FileTextIcon, PlusIcon } from "@lucide/solid";
import { For } from "solid-js";

import { Badge } from "../../../../../registry/ui/badge";
import { Button } from "../../../../../registry/ui/button";
import { Card, CardContent } from "../../../../../registry/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../../../registry/ui/empty";
import { Separator } from "../../../../../registry/ui/separator";

interface Stage {
  id: string;
  label: string;
  description: string;
  dotClassName: string;
}

const STAGES: Stage[] = [
  {
    description:
      "Start the writing process. Articles here are works in progress, visible only to editors and authors.",
    dotClassName: "bg-amber-600",
    id: "drafting",
    label: "Drafting",
  },
  {
    description:
      "Content undergoing editorial review. Track changes and word counts as pieces take shape.",
    dotClassName: "bg-orange-700",
    id: "in-revision",
    label: "In Revision",
  },
  {
    description:
      "The final polish before publication. Ensure all styling and factual checks are complete.",
    dotClassName: "bg-foreground",
    id: "final-edit",
    label: "Final Edit",
  },
];

export function EmptyDirectory() {
  return (
    <Card class="py-24">
      <CardContent class="flex flex-col items-center gap-10">
        <Empty class="min-h-96">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              class="bg-muted/70 text-muted-foreground size-14 rounded-full"
            >
              <FileTextIcon class="size-5" />
            </EmptyMedia>
            <EmptyTitle class="font-heading text-2xl tracking-normal normal-case">
              A Blank Canvas
            </EmptyTitle>
            <EmptyDescription>
              Your editorial directory is currently empty. Start building your
              publication&apos;s next issue by drafting the first piece.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <PlusIcon data-icon="inline-start" />
              Create first article
            </Button>
          </EmptyContent>
        </Empty>
        <Separator class="max-w-2xl" />
        <div class="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3">
          <For each={STAGES}>
            {(stage) => (
              <div class="flex flex-col gap-2">
                <Badge>
                  <span
                    aria-hidden="true"
                    class={`size-1.5 rounded-full ${stage.dotClassName}`}
                  />

                  {stage.label}
                </Badge>
                <p class="text-muted-foreground text-xs leading-relaxed">
                  {stage.description}
                </p>
              </div>
            )}
          </For>
        </div>
      </CardContent>
    </Card>
  );
}
