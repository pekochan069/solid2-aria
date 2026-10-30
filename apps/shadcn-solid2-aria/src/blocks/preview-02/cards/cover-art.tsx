/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/cover-art.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ImageIcon } from "@lucide/solid";

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "../../../registry/ui/card";
import { Item } from "../../../registry/ui/item";
import { Label } from "../../../registry/ui/label";

export function CoverArt() {
  return (
    <Card>
      <CardContent class="flex flex-col gap-3">
        <Label
          for="cover-art"
          class="text-muted-foreground text-center text-xs font-normal tracking-wider uppercase"
        >
          Cover Art
        </Label>
        <Item class="aspect-square" variant="outline">
          <label
            for="cover-art"
            class="flex size-full cursor-pointer items-center justify-center"
          >
            <ImageIcon class="text-muted-foreground/50 size-10" />
          </label>
        </Item>
        <input
          id="cover-art"
          type="file"
          accept="image/jpeg,image/png"
          class="sr-only"
        />
      </CardContent>
      <CardFooter class="flex-col gap-2">
        <label for="cover-art" class="w-full">
          <Button variant="secondary" class="w-full">
            Upload Artwork
          </Button>
        </label>
        <CardDescription class="text-center text-xs">
          Minimum 3000 × 3000px
          <br />
          JPEG or PNG only
        </CardDescription>
      </CardFooter>
    </Card>
  );
}

export default CoverArt;
