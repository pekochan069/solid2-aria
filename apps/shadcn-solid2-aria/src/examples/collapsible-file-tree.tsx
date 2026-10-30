/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/collapsible-file-tree.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronRightIcon, FileIcon, FolderIcon } from "@lucide/solid";
import { For } from "solid-js";

import { Button } from "../registry/ui/button";
import { Card, CardContent, CardHeader } from "../registry/ui/card";
import { Collapsible, CollapsibleContent } from "../registry/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "../registry/ui/tabs";

type FileTreeItem = { name: string } | { name: string; items: FileTreeItem[] };

export function CollapsibleFileTree() {
  const fileTree: FileTreeItem[] = [
    {
      items: [
        {
          items: [
            { name: "button.tsx" },
            { name: "card.tsx" },
            { name: "dialog.tsx" },
            { name: "input.tsx" },
            { name: "select.tsx" },
            { name: "table.tsx" },
          ],
          name: "ui",
        },
        { name: "login-form.tsx" },
        { name: "register-form.tsx" },
      ],
      name: "components",
    },
    {
      items: [{ name: "utils.ts" }, { name: "cn.ts" }, { name: "api.ts" }],
      name: "lib",
    },
    {
      items: [
        { name: "use-media-query.ts" },
        { name: "use-debounce.ts" },
        { name: "use-local-storage.ts" },
      ],
      name: "hooks",
    },
    {
      items: [{ name: "index.d.ts" }, { name: "api.d.ts" }],
      name: "types",
    },
    {
      items: [
        { name: "favicon.ico" },
        { name: "logo.svg" },
        { name: "images" },
      ],
      name: "public",
    },
    { name: "app.tsx" },
    { name: "layout.tsx" },
    { name: "globals.css" },
    { name: "package.json" },
    { name: "tsconfig.json" },
    { name: "README.md" },
    { name: ".gitignore" },
  ];

  const renderItem = (fileItem: FileTreeItem) => {
    if ("items" in fileItem) {
      return (
        <Collapsible>
          <Button
            slot="trigger"
            variant="ghost"
            size="sm"
            class="group hover:bg-accent hover:text-accent-foreground w-full justify-start transition-none"
          >
            <ChevronRightIcon class="transition-transform group-data-[state=open]:rotate-90" />
            <FolderIcon />
            {fileItem.name}
          </Button>
          <CollapsibleContent>
            <div class="style-lyra:ml-4 mt-1 ml-5 flex flex-col gap-1">
              <For each={fileItem.items}>{(child) => renderItem(child)}</For>
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        variant="link"
        size="sm"
        class="text-foreground w-full justify-start gap-2"
      >
        <FileIcon />
        <span>{fileItem.name}</span>
      </Button>
    );
  };

  return (
    <Card class="mx-auto w-full max-w-[16rem] gap-2" size="sm">
      <CardHeader>
        <Tabs defaultSelectedKey="explorer">
          <TabsList class="w-full">
            <TabsTrigger id="explorer">Explorer</TabsTrigger>
            <TabsTrigger id="settings">Outline</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-1">
          <For each={fileTree}>{(item) => renderItem(item)}</For>
        </div>
      </CardContent>
    </Card>
  );
}

export default CollapsibleFileTree;
