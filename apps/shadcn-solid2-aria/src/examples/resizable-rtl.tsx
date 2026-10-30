/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/resizable-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../registry/ui/resizable";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      one: "واحد",
      three: "ثلاثة",
      two: "اثنان",
    },
  },
  en: {
    dir: "ltr",
    values: {
      one: "One",
      three: "Three",
      two: "Two",
    },
  },
  he: {
    dir: "rtl",
    values: {
      one: "אחד",
      three: "שלושה",
      two: "שניים",
    },
  },
} satisfies Translations;

export function ResizableRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      class="max-w-sm rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div class="flex h-[200px] items-center justify-center p-6">
          <span class="font-semibold">{t.one}</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={25}>
            <div class="flex h-full items-center justify-center p-6">
              <span class="font-semibold">{t.two}</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div class="flex h-full items-center justify-center p-6">
              <span class="font-semibold">{t.three}</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ResizableRtl;
