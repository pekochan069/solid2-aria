/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/combobox-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createMemo, For } from "solid-js";

import { hasKey } from "../lib/has-key";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "../registry/ui/combobox";
import { Field, FieldLabel } from "../registry/ui/field";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const categories = [
  "technology",
  "design",
  "business",
  "marketing",
  "education",
  "health",
] as const;

const translations = {
  ar: {
    dir: "rtl",
    values: {
      business: "الأعمال",
      design: "التصميم",
      education: "التعليم",
      empty: "لم يتم العثور على فئات.",
      health: "الصحة",
      label: "الفئات",
      marketing: "التسويق",
      placeholder: "أضف فئات",
      technology: "التكنولوجيا",
    },
  },
  en: {
    dir: "ltr",
    values: {
      business: "Business",
      design: "Design",
      education: "Education",
      empty: "No categories found.",
      health: "Health",
      label: "Categories",
      marketing: "Marketing",
      placeholder: "Add categories",
      technology: "Technology",
    },
  },
  he: {
    dir: "rtl",
    values: {
      business: "עסקים",
      design: "עיצוב",
      education: "חינוך",
      empty: "לא נמצאו קטגוריות.",
      health: "בריאות",
      label: "קטגוריות",
      marketing: "שיווק",
      placeholder: "הוסף קטגוריות",
      technology: "טכנולוגיה",
    },
  },
} satisfies Translations;

export function ComboboxRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");

  const categoryLabels = createMemo<Record<string, string>>(
    () =>
      ({
        business: t.business,
        design: t.design,
        education: t.education,
        health: t.health,
        marketing: t.marketing,
        technology: t.technology,
      }) satisfies Record<string, string>
  );

  return (
    <Field class="mx-auto w-full max-w-xs">
      <FieldLabel>{t.label}</FieldLabel>
      <Combobox
        aria-label={t.label}
        selectionMode="multiple"
        defaultValue={[categories[0]]}
        allowsEmptyCollection
      >
        <ComboboxChips>
          <ComboboxChipList<{ name: string }>>
            {(value) => (
              <ComboboxChip id={value.name}>
                {hasKey(categoryLabels(), value.name)
                  ? categoryLabels()[value.name]
                  : value.name}
              </ComboboxChip>
            )}
          </ComboboxChipList>
          <ComboboxChipsInput placeholder={t.placeholder} />
        </ComboboxChips>
        <ComboboxContent data-lang={dir === "rtl" ? language : undefined}>
          <ComboboxList
            renderEmptyState={() => <ComboboxEmpty>{t.empty}</ComboboxEmpty>}
          >
            {
              <For each={categories}>
                {(item) => (
                  <ComboboxItem id={item} value={{ name: item }}>
                    {hasKey(categoryLabels(), item)
                      ? categoryLabels()[item]
                      : item}
                  </ComboboxItem>
                )}
              </For>
            }
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

export default ComboboxRtl;
