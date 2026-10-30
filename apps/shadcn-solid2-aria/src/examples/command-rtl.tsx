/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/command-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "@lucide/solid";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../registry/ui/command";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      billing: "الفوترة",
      calculator: "الآلة الحاسبة",
      calendar: "التقويم",
      empty: "لم يتم العثور على نتائج.",
      placeholder: "اكتب أمرًا أو ابحث...",
      profile: "الملف الشخصي",
      searchEmoji: "البحث عن الرموز التعبيرية",
      settings: "الإعدادات",
      suggestions: "اقتراحات",
    },
  },
  en: {
    dir: "ltr",
    values: {
      billing: "Billing",
      calculator: "Calculator",
      calendar: "Calendar",
      empty: "No results found.",
      placeholder: "Type a command or search...",
      profile: "Profile",
      searchEmoji: "Search Emoji",
      settings: "Settings",
      suggestions: "Suggestions",
    },
  },
  he: {
    dir: "rtl",
    values: {
      billing: "חיוב",
      calculator: "מחשבון",
      calendar: "לוח שנה",
      empty: "לא נמצאו תוצאות.",
      placeholder: "הקלד פקודה או חפש...",
      profile: "פרופיל",
      searchEmoji: "חפש אמוג'י",
      settings: "הגדרות",
      suggestions: "הצעות",
    },
  },
} satisfies Translations;

export function CommandRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Command class="max-w-sm rounded-lg border">
      <CommandInput placeholder={t.placeholder} />
      <CommandList
        renderEmptyState={() => <CommandEmpty>{t.empty}</CommandEmpty>}
      >
        <CommandGroup heading={t.suggestions}>
          <CommandItem textValue={t.calendar}>
            <Calendar />
            <span>{t.calendar}</span>
          </CommandItem>
          <CommandItem textValue={t.searchEmoji}>
            <Smile />
            <span>{t.searchEmoji}</span>
          </CommandItem>
          <CommandItem textValue={t.calculator} isDisabled>
            <Calculator />
            <span>{t.calculator}</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t.settings}>
          <CommandItem textValue={t.profile}>
            <User />
            <span>{t.profile}</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem textValue={t.billing}>
            <CreditCard />
            <span>{t.billing}</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem textValue={t.settings}>
            <Settings />
            <span>{t.settings}</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export default CommandRtl;
