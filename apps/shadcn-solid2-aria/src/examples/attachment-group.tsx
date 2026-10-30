/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/attachment-group.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { FileCodeIcon, FileTextIcon, TableIcon, XIcon } from "@lucide/solid";
import type { LucideIcon } from "@lucide/solid";
import { dynamic } from "@solidjs/web";
import { Switch, Match, For } from "solid-js";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "../registry/ui/attachment";

interface Item {
  name: string;
  meta: string;
  icon?: LucideIcon;
  src?: string;
}

const items: Item[] = [
  { icon: FileTextIcon, meta: "PDF · 1.4 MB", name: "briefing-notes.pdf" },
  {
    meta: "PNG · 820 KB",
    name: "workspace.png",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
  },
  { icon: TableIcon, meta: "CSV · 18 KB", name: "customers.csv" },
  { icon: FileCodeIcon, meta: "TSX · 12 KB", name: "renderer.tsx" },
];

export function AttachmentGroupDemo() {
  return (
    <div class="mx-auto w-full max-w-sm py-12">
      <AttachmentGroup class="w-full">
        {
          <For each={items}>
            {(item) => {
              const Icon = dynamic(() => item.icon ?? "span");

              return (
                <Attachment class="w-64">
                  {
                    <Switch fallback={null}>
                      <Match when={(item.src ?? "") !== ""}>
                        {
                          <AttachmentMedia variant="image">
                            <img src={item.src} alt={item.name} />
                          </AttachmentMedia>
                        }
                      </Match>
                      <Match when={item.icon !== undefined}>
                        {
                          <AttachmentMedia>
                            <Icon />
                          </AttachmentMedia>
                        }
                      </Match>
                    </Switch>
                  }
                  <AttachmentContent>
                    <AttachmentTitle>{item.name}</AttachmentTitle>
                    <AttachmentDescription>{item.meta}</AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction aria-label={`Remove ${item.name}`}>
                      <XIcon />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              );
            }}
          </For>
        }
      </AttachmentGroup>
    </div>
  );
}

export default AttachmentGroupDemo;
