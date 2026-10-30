/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/scroll-area-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { ScrollArea } from "../registry/ui/scroll-area";
import { Separator } from "../registry/ui/separator";
import { Fragment, useTranslation } from "./_support";
import type { Translations } from "./_support";

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

const translations = {
  ar: {
    dir: "rtl",
    values: {
      tags: "العلامات",
    },
  },
  en: {
    dir: "ltr",
    values: {
      tags: "Tags",
    },
  },
  he: {
    dir: "rtl",
    values: {
      tags: "תגיות",
    },
  },
} satisfies Translations;

export function ScrollAreaRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <ScrollArea class="h-72 w-48 rounded-md border">
      <div class="p-4">
        <h4 class="mb-4 text-sm leading-none font-medium">{t.tags}</h4>
        {
          <For each={tags}>
            {(tag) => (
              <Fragment>
                <div class="text-sm">{tag}</div>
                <Separator class="my-2" />
              </Fragment>
            )}
          </For>
        }
      </div>
    </ScrollArea>
  );
}

export default ScrollAreaRtl;
