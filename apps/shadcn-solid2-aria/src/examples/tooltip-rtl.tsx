/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/tooltip-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../registry/ui/button";
import { Tooltip, TooltipTrigger } from "../registry/ui/tooltip";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      bottom: "أسفل",
      content: "إضافة إلى المكتبة",
      end: "نهاية السطر",
      left: "يسار",
      right: "يمين",
      start: "بداية السطر",
      top: "أعلى",
    },
  },
  en: {
    dir: "ltr",
    values: {
      bottom: "Bottom",
      content: "Add to library",
      end: "End",
      left: "Left",
      right: "Right",
      start: "Start",
      top: "Top",
    },
  },
  he: {
    dir: "rtl",
    values: {
      bottom: "למטה",
      content: "הוסף לספרייה",
      end: "סוף השורה",
      left: "שמאל",
      right: "ימין",
      start: "תחילת השורה",
      top: "למעלה",
    },
  },
} satisfies Translations;

const physicalSides = ["left", "top", "bottom", "right"] as const;
const logicalPlacements = ["start", "end"] as const;

export function TooltipRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <div class="grid gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        {
          <For each={physicalSides}>
            {(side) => (
              <TooltipTrigger>
                <Button variant="outline">{t[side]}</Button>
                <Tooltip placement={side}>{t.content}</Tooltip>
              </TooltipTrigger>
            )}
          </For>
        }
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        {
          <For each={logicalPlacements}>
            {(placement) => (
              <TooltipTrigger>
                <Button variant="outline">{t[placement]}</Button>
                <Tooltip placement={placement}>{t.content}</Tooltip>
              </TooltipTrigger>
            )}
          </For>
        }
      </div>
    </div>
  );
}

export default TooltipRtl;
