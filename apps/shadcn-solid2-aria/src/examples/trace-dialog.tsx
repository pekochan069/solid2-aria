/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/trace-dialog.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowUpRightIcon, ChevronRightIcon, GlobeIcon } from "@lucide/solid";
import { Button as ButtonPrimitive } from "@solid2-aria/components";
import { For } from "solid-js";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../registry/ui/dialog";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "../registry/ui/trace";

const results = [
  {
    title: "Caching build outputs",
    url: "https://nextjs.org/docs/app/guides/caching",
  },
  {
    title: "Image optimization reference",
    url: "https://nextjs.org/docs/app/api-reference/components/image",
  },
  {
    title: "Deploy hooks and cache keys",
    url: "https://vercel.com/docs/deploy-hooks",
  },
];

export function TraceDialog() {
  return (
    <Trace class="max-w-sm">
      <DialogTrigger>
        <ButtonPrimitive>
          <TraceLine>
            <TraceIcon>
              <GlobeIcon />
            </TraceIcon>
            <TraceTitle>Searched the web for cache keys</TraceTitle>
            <TraceIcon>
              <ChevronRightIcon />
            </TraceIcon>
          </TraceLine>
        </ButtonPrimitive>
        <Dialog>
          <DialogHeader>
            <DialogTitle>Searched the web for cache keys</DialogTitle>
            <DialogDescription>
              Three results were used in the response.
            </DialogDescription>
          </DialogHeader>
          <Trace>
            {
              <For each={results}>
                {(result) => (
                  <a href={result.url} target="_blank" rel="noreferrer">
                    <TraceLine>
                      <TraceIcon>
                        <GlobeIcon />
                      </TraceIcon>
                      <TraceTitle>
                        {result.title}
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
        </Dialog>
      </DialogTrigger>
    </Trace>
  );
}

export default TraceDialog;
