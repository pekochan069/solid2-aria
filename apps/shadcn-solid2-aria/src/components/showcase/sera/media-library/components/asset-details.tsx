/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/media-library/components/asset-details.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  PlusIcon,
  VideoIcon,
} from "@lucide/solid";
import { Switch, Match, For } from "solid-js";

import { Badge } from "../../../../../registry/ui/badge";
import { Button } from "../../../../../registry/ui/button";
import { Card, CardContent, CardFooter } from "../../../../../registry/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../../../../../registry/ui/item";
import { Separator } from "../../../../../registry/ui/separator";
import type { Asset, AssetType } from "../data";

const TYPE_LABEL: Record<AssetType, string> = {
  JPEG: "Image / JPEG",
  MP4: "Video / MP4",
  PDF: "Document / PDF",
  PNG: "Image / PNG",
  WEBP: "Image / WEBP",
};

export function AssetDetails(props: { asset: Asset }) {
  return (
    <Card class="gap-0">
      <CardContent class="flex flex-col gap-6">
        <div class="bg-muted/60 text-muted-foreground/60 ring-border/70 flex aspect-5/4 items-center justify-center ring-1 ring-inset">
          {
            <Switch fallback={<ImageIcon class="size-8" />}>
              <Match when={props.asset.type === "MP4"}>
                {<VideoIcon class="size-8" />}
              </Match>
              <Match when={props.asset.type === "PDF"}>
                {<FileTextIcon class="size-8" />}
              </Match>
            </Switch>
          }
        </div>
        <h2 class="font-heading line-clamp-2 text-xl tracking-wide">
          {props.asset.name}
        </h2>
        <Separator />
        <dl class="flex flex-col gap-5 text-sm">
          <div class="flex flex-col gap-1.5">
            <dt class="text-muted-foreground text-[0.625rem] font-semibold tracking-widest uppercase">
              Asset Type
            </dt>
            <dd>{TYPE_LABEL[props.asset.type]}</dd>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <dt class="text-muted-foreground text-[0.625rem] font-semibold tracking-widest uppercase">
                Dimensions
              </dt>
              <dd>{props.asset.dimensions}</dd>
            </div>
            <div class="flex flex-col gap-1.5">
              <dt class="text-muted-foreground text-[0.625rem] font-semibold tracking-widest uppercase">
                File Size
              </dt>
              <dd>{props.asset.size}</dd>
            </div>
          </div>
        </dl>
        <Separator />
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h3 class="text-muted-foreground text-[0.625rem] font-semibold tracking-widest uppercase">
              Tags
            </h3>
            <Button variant="ghost" size="icon-xs" aria-label="Add tag">
              <PlusIcon />
            </Button>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-2">
            <For each={props.asset.tags}>{(tag) => <Badge>{tag}</Badge>}</For>
          </div>
        </div>
        <Separator />
        <div class="flex flex-col gap-3">
          <h3 class="text-muted-foreground text-[0.625rem] font-semibold tracking-widest uppercase">
            Used In
          </h3>
          <div class="flex flex-col gap-2">
            <For each={props.asset.usedIn}>
              {(usage) => (
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>{usage.title}</ItemTitle>
                    <ItemDescription>{usage.role}</ItemDescription>
                  </ItemContent>
                </Item>
              )}
            </For>
          </div>
        </div>
      </CardContent>
      <CardFooter class="mt-6 border-t pt-6">
        <Button class="w-full">
          <DownloadIcon data-icon="inline-start" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
