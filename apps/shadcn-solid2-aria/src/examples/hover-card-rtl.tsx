/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/hover-card-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../registry/ui/button";
import { HoverCard, HoverCardTrigger } from "../registry/ui/hover-card";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      bottom: "أسفل",
      end: "نهاية السطر",
      left: "يسار",
      name: "سماعات لاسلكية",
      price: "٩٩.٩٩ $",
      right: "يمين",
      start: "بداية السطر",
      top: "أعلى",
    },
  },
  en: {
    dir: "ltr",
    values: {
      bottom: "Bottom",
      end: "End",
      left: "Left",
      name: "Wireless Headphones",
      price: "$99.99",
      right: "Right",
      start: "Start",
      top: "Top",
    },
  },
  he: {
    dir: "rtl",
    values: {
      bottom: "למטה",
      end: "סוף השורה",
      left: "שמאל",
      name: "אוזניות אלחוטיות",
      price: "99.99 $",
      right: "ימין",
      start: "תחילת השורה",
      top: "למעלה",
    },
  },
} satisfies Translations;

const physicalSides = ["left", "top", "bottom", "right"] as const;
const logicalPlacements = ["start", "end"] as const;

export function HoverCardRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <div class="grid gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        {
          <For each={physicalSides}>
            {(side) => (
              <HoverCardTrigger delay={10} closeDelay={100}>
                <Button variant="outline">{t[side]}</Button>
                <HoverCard placement={side} class="flex w-64 flex-col gap-1">
                  <div class="font-semibold">{t.name}</div>
                  <div class="text-muted-foreground text-sm">{t.price}</div>
                </HoverCard>
              </HoverCardTrigger>
            )}
          </For>
        }
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        {
          <For each={logicalPlacements}>
            {(placement) => (
              <HoverCardTrigger delay={10} closeDelay={100}>
                <Button variant="outline">{t[placement]}</Button>
                <HoverCard
                  placement={placement}
                  class="flex w-64 flex-col gap-1"
                >
                  <div class="font-semibold">{t.name}</div>
                  <div class="text-muted-foreground text-sm">{t.price}</div>
                </HoverCard>
              </HoverCardTrigger>
            )}
          </For>
        }
      </div>
    </div>
  );
}

export default HoverCardRtl;
