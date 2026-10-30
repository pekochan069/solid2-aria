/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/field-hear.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Card, CardContent } from "../../../registry/ui/card";
import { Checkbox } from "../../../registry/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "../../../registry/ui/field";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    description: "اختر الخيار الذي يصف أفضل طريقة سمعت عنا من خلالها.",
    dir: "rtl" as const,
    legend: "كيف سمعت عنا؟",
    other: "أخرى",
    referral: "إحالة",
    searchEngine: "البحث",
    socialMedia: "التواصل الاجتماعي",
  },
  he: {
    description: "בחר את האפשרות שמתארת בצורה הטובה ביותר כיצד שמעת עלינו.",
    dir: "rtl" as const,
    legend: "איך שמעת עלינו?",
    other: "אחר",
    referral: "הפניה",
    searchEngine: "חיפוש",
    socialMedia: "חברתיות",
  },
};

export function FieldHear() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  const options = () => [
    { label: t().socialMedia, value: "social-media" },
    { label: t().searchEngine, value: "search-engine" },
    { label: t().referral, value: "referral" },
    { label: t().other, value: "other" },
  ];

  return (
    <div dir={t().dir}>
      <Card class="border-0 py-4 shadow-none">
        <CardContent class="px-4">
          <form>
            <FieldGroup>
              <FieldSet class="gap-4">
                <FieldLegend>{t().legend}</FieldLegend>
                <FieldDescription class="line-clamp-1">
                  {t().description}
                </FieldDescription>
                <FieldGroup class="flex flex-row flex-wrap gap-2 [--radius:9999rem]">
                  <For each={options()}>
                    {(option) => (
                      <FieldLabel
                        for={`rtl-${option.value}`}

                        class="w-fit!"
                      >
                        <Field
                          orientation="horizontal"
                          class="gap-1.5 overflow-hidden px-3! py-1.5! transition-all duration-100 ease-linear group-has-data-selected/field-label:px-2!"
                        >
                          <Checkbox
                            value={option.value}
                            id={`rtl-${option.value}`}
                            defaultSelected={option.value === "social-media"}
                            class="-ms-6 translate-x-1 rounded-full transition-all duration-100 ease-linear data-checked:ms-0 data-checked:translate-x-0"
                          />
                          <FieldTitle>{option.label}</FieldTitle>
                        </Field>
                      </FieldLabel>
                    )}
                  </For>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
