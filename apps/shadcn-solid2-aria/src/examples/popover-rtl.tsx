/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/popover-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../registry/ui/popover";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      bottom: "أسفل",
      description: "تعيين الأبعاد للطبقة.",
      end: "نهاية السطر",
      left: "يسار",
      right: "يمين",
      start: "بداية السطر",
      title: "الأبعاد",
      top: "أعلى",
    },
  },
  en: {
    dir: "ltr",
    values: {
      bottom: "Bottom",
      description: "Set the dimensions for the layer.",
      end: "End",
      left: "Left",
      right: "Right",
      start: "Start",
      title: "Dimensions",
      top: "Top",
    },
  },
  he: {
    dir: "rtl",
    values: {
      bottom: "למטה",
      description: "הגדר את המימדים לשכבה.",
      end: "סוף השורה",
      left: "שמאל",
      right: "ימין",
      start: "תחילת השורה",
      title: "מימדים",
      top: "למעלה",
    },
  },
} satisfies Translations;

const physicalSides = ["left", "top", "bottom", "right"] as const;
const logicalPlacements = ["start", "end"] as const;

export function PopoverRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <div class="grid gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        {
          <For each={physicalSides}>
            {(side) => (
              <PopoverTrigger>
                <Button variant="outline">{t[side]}</Button>
                <Popover placement={side}>
                  <PopoverHeader>
                    <PopoverTitle>{t.title}</PopoverTitle>
                    <PopoverDescription>{t.description}</PopoverDescription>
                  </PopoverHeader>
                </Popover>
              </PopoverTrigger>
            )}
          </For>
        }
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        {
          <For each={logicalPlacements}>
            {(placement) => (
              <PopoverTrigger>
                <Button variant="outline">{t[placement]}</Button>
                <Popover placement={placement}>
                  <PopoverHeader>
                    <PopoverTitle>{t.title}</PopoverTitle>
                    <PopoverDescription>{t.description}</PopoverDescription>
                  </PopoverHeader>
                </Popover>
              </PopoverTrigger>
            )}
          </For>
        }
      </div>
    </div>
  );
}

export default PopoverRtl;
