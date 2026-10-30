/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/trace-sources.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowUpRightIcon, GlobeIcon } from "@lucide/solid";
import { For } from "solid-js";

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../registry/ui/trace";

const sources = [
  {
    href: "https://docs.astro.build/en/install-and-setup/",
    title: "Install Astro | docs.astro.build",
  },
  {
    href: "https://www.npmjs.com/package/create-astro",
    title: "create-astro | npmjs.com",
  },
  {
    href: "https://pnpm.io/settings#minimumreleaseage",
    title: "Settings: minimumReleaseAge | pnpm.io",
  },
];

export function TraceSources() {
  return (
    <div class="w-full max-w-sm">
      <TraceCollapsible defaultExpanded>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <GlobeIcon />
            </TraceIcon>
            <TraceTitle>Used {sources.length} sources</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {
              <For each={sources}>
                {(source) => (
                  <a href={source.href} target="_blank" rel="noreferrer">
                    <TraceLine>
                      <TraceIcon>
                        <GlobeIcon />
                      </TraceIcon>
                      <TraceTitle>
                        {source.title}
                        <span class="sr-only"> (opens in a new tab)</span>
                      </TraceTitle>
                      <TraceIcon>
                        <ArrowUpRightIcon />
                      </TraceIcon>
                    </TraceLine>
                  </a>
                )}
              </For>
            }
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </div>
  );
}

export default TraceSources;
