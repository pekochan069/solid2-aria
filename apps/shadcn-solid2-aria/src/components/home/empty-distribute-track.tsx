/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/empty-distribute-track.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local Solid2 Aria components, native attributes, and upstream Hugeicons SVGs.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import PlusSignIcon from "@hugeicons/core-free-icons/PlusSignIcon";

import { Button } from "../../registry/ui/button";
import { Card, CardContent } from "../../registry/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../registry/ui/empty";
import { HugeIcon } from "../huge-icon";

export function EmptyDistributeTrack() {
  return (
    <Card>
      <CardContent>
        <Empty class="p-4">
          <EmptyMedia variant="icon">
            <HugeIcon icon={PlusSignIcon} stroke-width={2} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Distribute Track</EmptyTitle>
            <EmptyDescription>
              Upload your first master to start reaching listeners on Spotify,
              Apple Music, and more.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Create Release</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}
