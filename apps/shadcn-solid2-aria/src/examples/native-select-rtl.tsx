/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/native-select-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { NativeSelect, NativeSelectOption } from "../registry/ui/native-select";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      cancelled: "ملغي",
      done: "منجز",
      inProgress: "قيد التنفيذ",
      placeholder: "اختر الحالة",
      todo: "مهام",
    },
  },
  en: {
    dir: "ltr",
    values: {
      cancelled: "Cancelled",
      done: "Done",
      inProgress: "In Progress",
      placeholder: "Select status",
      todo: "Todo",
    },
  },
  he: {
    dir: "rtl",
    values: {
      cancelled: "בוטל",
      done: "הושלם",
      inProgress: "בתהליך",
      placeholder: "בחר סטטוס",
      todo: "לעשות",
    },
  },
} satisfies Translations;

export function NativeSelectRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <NativeSelect>
      <NativeSelectOption value="">{t.placeholder}</NativeSelectOption>
      <NativeSelectOption value="todo">{t.todo}</NativeSelectOption>
      <NativeSelectOption value="in-progress">
        {t.inProgress}
      </NativeSelectOption>
      <NativeSelectOption value="done">{t.done}</NativeSelectOption>
      <NativeSelectOption value="cancelled">{t.cancelled}</NativeSelectOption>
    </NativeSelect>
  );
}

export default NativeSelectRtl;
