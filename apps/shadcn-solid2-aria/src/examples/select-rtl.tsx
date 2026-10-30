/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/select-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/components";
import { createSignal, For } from "solid-js";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../registry/ui/select";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      apple: "تفاح",
      banana: "موز",
      blueberry: "توت أزرق",
      broccoli: "بروكلي",
      carrot: "جزر",
      fruits: "الفواكه",
      grapes: "عنب",
      pineapple: "أناناس",
      selectFruit: "اختر فاكهة",
      spinach: "سبانخ",
      vegetables: "الخضروات",
    },
  },
  en: {
    dir: "ltr",
    values: {
      apple: "Apple",
      banana: "Banana",
      blueberry: "Blueberry",
      broccoli: "Broccoli",
      carrot: "Carrot",
      fruits: "Fruits",
      grapes: "Grapes",
      pineapple: "Pineapple",
      selectFruit: "Select a fruit",
      spinach: "Spinach",
      vegetables: "Vegetables",
    },
  },
  he: {
    dir: "rtl",
    values: {
      apple: "תפוח",
      banana: "בננה",
      blueberry: "אוכמניה",
      broccoli: "ברוקולי",
      carrot: "גזר",
      fruits: "פירות",
      grapes: "ענבים",
      pineapple: "אננס",
      selectFruit: "בחר פרי",
      spinach: "תרד",
      vegetables: "ירקות",
    },
  },
} satisfies Translations;

export function SelectRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");
  const [selectedFruit, setSelectedFruit] = createSignal<Key | null>(null);

  const fruits = [
    { label: t.apple, value: "apple" },
    { label: t.banana, value: "banana" },
    { label: t.blueberry, value: "blueberry" },
    { label: t.grapes, value: "grapes" },
    { label: t.pineapple, value: "pineapple" },
  ];

  const vegetables = [
    { label: t.carrot, value: "carrot" },
    { label: t.broccoli, value: "broccoli" },
    { label: t.spinach, value: "spinach" },
  ];

  return (
    <Select
      aria-label={t.selectFruit}
      value={selectedFruit()}
      onChange={(value) => {
        setSelectedFruit(value);
      }}
      placeholder={t.selectFruit}
      class="w-32"
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent data-lang={dir === "rtl" ? language : undefined}>
        <SelectGroup>
          <SelectLabel>{t.fruits}</SelectLabel>
          {
            <For each={fruits}>
              {(item) => <SelectItem id={item.value}>{item.label}</SelectItem>}
            </For>
          }
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>{t.vegetables}</SelectLabel>
          {
            <For each={vegetables}>
              {(item) => <SelectItem id={item.value}>{item.label}</SelectItem>}
            </For>
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default SelectRtl;
