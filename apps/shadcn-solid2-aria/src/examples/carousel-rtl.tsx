/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/carousel-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Card, CardContent } from "../registry/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../registry/ui/carousel";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {},
  },
  en: {
    dir: "ltr",
    values: {},
  },
  he: {
    dir: "rtl",
    values: {},
  },
} satisfies Translations;

function toArabicNumerals(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[Math.trunc(Number(digit))])
    .join("");
}

export function CarouselRtl() {
  const { dir, language } = useTranslation(translations, "ar");

  const formatNumber = (num: number): string => {
    if (language === "ar") {
      return toArabicNumerals(num);
    }

    return num.toString();
  };

  return (
    <Carousel
      class="w-full max-w-[12rem] sm:max-w-xs"
      opts={{
        direction: dir,
      }}
    >
      <CarouselContent>
        {
          <For each={Array.from({ length: 5 })}>
            {(_, index) => (
              <CarouselItem>
                <div class="p-1">
                  <Card>
                    <CardContent class="flex aspect-square items-center justify-center p-6">
                      <span class="text-4xl font-semibold">
                        {formatNumber(index() + 1)}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )}
          </For>
        }
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default CarouselRtl;
