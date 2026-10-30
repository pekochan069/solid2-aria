/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/button-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowRightIcon, PlusIcon } from "@lucide/solid";

import { Button } from "../registry/ui/button";
import { Spinner } from "../registry/ui/spinner";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      button: "زر",
      delete: "حذف",
      loading: "جاري التحميل",
      submit: "إرسال",
    },
  },
  en: {
    dir: "ltr",
    values: {
      button: "Button",
      delete: "Delete",
      loading: "Loading",
      submit: "Submit",
    },
  },
  he: {
    dir: "rtl",
    values: {
      button: "כפתור",
      delete: "מחק",
      loading: "טוען",
      submit: "שלח",
    },
  },
} satisfies Translations;

export function ButtonRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  return (
    <div class="flex flex-wrap items-center gap-2 md:flex-row" dir={dir}>
      <Button variant="outline">{t.button}</Button>
      <Button variant="destructive">{t.delete}</Button>
      <Button variant="outline">
        {t.submit}{" "}
        <ArrowRightIcon class="rtl:rotate-180" data-icon="inline-end" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button variant="secondary" isDisabled>
        <Spinner data-icon="inline-start" /> {t.loading}
      </Button>
    </div>
  );
}

export default ButtonRtl;
