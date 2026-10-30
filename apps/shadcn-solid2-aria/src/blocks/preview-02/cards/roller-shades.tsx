/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/roller-shades.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createMemo, createSignal } from "solid-js";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { Slider } from "../../../registry/ui/slider";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../registry/ui/toggle-group";

export function RollerShades() {
  const [position, setPosition] = createSignal([50]);

  const preset = createMemo(() =>
    (() => {
      if ((position()[0] ?? 0) <= 10) {
        return "open";
      }

      if ((position()[0] ?? 0) >= 90) {
        return "closed";
      }

      return "half";
    })()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Living Room</CardTitle>
        <CardDescription>Roller Shades</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="bg-muted flex h-32 flex-col overflow-hidden rounded-lg border">
          <div
            class="bg-muted-foreground transition-all duration-300"
            style={{ height: `${position()[0]}%` }}
          />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Open
          </span>
          <Slider
            value={position()}
            onChange={(value) => {
              setPosition(Array.isArray(value) ? [...value] : [value]);
            }}
            maxValue={100}
            class="flex-1"
          />
          <span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Close
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <ToggleGroup
          selectedKeys={[preset()]}
          onSelectionChange={(value) => {
            const [v] = value;

            if (v === "open") {
              setPosition([0]);
            }

            if (v === "half") {
              setPosition([50]);
            }

            if (v === "closed") {
              setPosition([100]);
            }
          }}
          variant="outline"
          spacing={1}
          class="w-full"
        >
          <ToggleGroupItem id="open" class="flex-1">
            Open
          </ToggleGroupItem>
          <ToggleGroupItem id="half" class="flex-1">
            Half
          </ToggleGroupItem>
          <ToggleGroupItem id="closed" class="flex-1">
            Closed
          </ToggleGroupItem>
        </ToggleGroup>
      </CardFooter>
    </Card>
  );
}

export default RollerShades;
