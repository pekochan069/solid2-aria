/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/album-card.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Badge } from "../../../registry/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../../../registry/ui/card";
import { Separator } from "../../../registry/ui/separator";

export function AlbumCard() {
  return (
    <Card>
      <CardContent class="flex flex-col gap-4">
        <div class="relative overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=800&fit=crop"
            alt="Synthetic Horizons EP cover art"
            class="aspect-square w-full object-cover"
          />
          <Badge class="absolute top-3 right-3">$26,033.79</Badge>
        </div>
        <div class="flex flex-col gap-1">
          <CardTitle>Synthetic Horizons EP</CardTitle>
          <CardDescription class="text-xs tracking-wider uppercase">
            Released Aug 14, 2023
          </CardDescription>
        </div>
      </CardContent>
      <CardFooter class="flex-col gap-4">
        <Separator />
        <div class="grid w-full grid-cols-2 gap-4">
          <div class="flex flex-col gap-0.5">
            <span class="text-muted-foreground text-xs tracking-wider uppercase">
              Tracks
            </span>
            <span class="text-lg font-medium tabular-nums">6 Tracks</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-muted-foreground line-clamp-1 text-xs tracking-wider uppercase">
              Cumulative Streams
            </span>
            <span class="text-lg font-medium tabular-nums">6,198,524</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AlbumCard;
