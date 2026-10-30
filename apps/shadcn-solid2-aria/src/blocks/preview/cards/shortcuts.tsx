/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/shortcuts.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Card, CardContent } from "../../../registry/ui/card";
import {
  Item,
  ItemActions,
  ItemGroup,
  ItemHeader,
  ItemSeparator,
  ItemTitle,
} from "../../../registry/ui/item";
import { Kbd } from "../../../registry/ui/kbd";
import { Fragment } from "../../_config";

const shortcuts = [
  { keys: ["⌘", "K"], label: "Search" },
  { keys: ["⌘", "J"], label: "Quick Actions" },
  { keys: ["⌘", "N"], label: "New File" },
  { keys: ["⌘", "S"], label: "Save" },
  { keys: ["⌘", "B"], label: "Toggle Sidebar" },
] as const;

export function Shortcuts() {
  return (
    <Card>
      <CardContent>
        <div class="flex flex-col gap-3">
          <div class="text-sm font-medium">Shortcuts</div>
          <ItemGroup class="text-muted-foreground gap-2" data-size="xs">
            {
              <For each={shortcuts}>
                {({ label, keys }, i) => (
                  <Fragment>
                    {i() > 0 && <ItemSeparator />}
                    <Item
                      variant="default"
                      size="xs"
                      class="border-0 px-0 py-0"
                    >
                      <ItemHeader>
                        <ItemTitle class="font-normal">{label}</ItemTitle>
                        <ItemActions>
                          <div class="flex gap-1">
                            {<For each={keys}>{(key) => <Kbd>{key}</Kbd>}</For>}
                          </div>
                        </ItemActions>
                      </ItemHeader>
                    </Item>
                  </Fragment>
                )}
              </For>
            }
          </ItemGroup>
        </div>
      </CardContent>
    </Card>
  );
}

export default Shortcuts;
