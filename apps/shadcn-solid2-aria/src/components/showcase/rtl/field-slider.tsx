/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/field-slider.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import {
  Field,
  FieldDescription,
  FieldTitle,
} from "../../../registry/ui/field";
import { Slider } from "../../../registry/ui/slider";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    ariaLabel: "نطاق السعر",
    currency: "﷼",
    description: "حدد نطاق ميزانيتك",
    dir: "rtl" as const,
    locale: "ar-SA",
    title: "نطاق السعر",
  },
  he: {
    ariaLabel: "טווח מחירים",
    currency: "₪",
    description: "הגדר את טווח התקציב שלך",
    dir: "rtl" as const,
    locale: "he-IL",
    title: "טווח מחירים",
  },
};

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function FieldSlider() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];
  const [value, setValue] = createSignal<[number, number]>([200, 800]);

  return (
    <Field dir={t().dir}>
      <FieldTitle>{t().title}</FieldTitle>
      <FieldDescription>
        {t().description} ({t().currency}
        <span class="font-medium tabular-nums">
          {formatNumber(value()[0], t().locale)}
        </span>{" "}
        -{" "}
        <span class="font-medium tabular-nums">
          {formatNumber(value()[1], t().locale)}
        </span>
        ).
      </FieldDescription>
      <Slider
        value={value()}
        onChange={(valueValue) => {
          setValue(valueValue);
        }}
        maxValue={1000}
        minValue={0}
        step={10}
        class="mt-2 w-full"
        aria-label={t().ariaLabel}
      />
    </Field>
  );
}
