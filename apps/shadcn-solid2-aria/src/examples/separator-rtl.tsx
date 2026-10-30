/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/separator-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Separator } from "../registry/ui/separator";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      description:
        "مجموعة من المكونات المصممة بشكل جميل يمكنك تخصيصها وتوسيعها والبناء عليها.",
      subtitle: "الأساس لنظام التصميم الخاص بك",
      title: "shadcn/ui",
    },
  },
  en: {
    dir: "ltr",
    values: {
      description:
        "A set of beautifully designed components that you can customize, extend, and build on.",
      subtitle: "The Foundation for your Design System",
      title: "shadcn/ui",
    },
  },
  he: {
    dir: "rtl",
    values: {
      description:
        "סט של רכיבים מעוצבים בצורה יפה שאתה יכול להתאים אישית, להרחיב ולבנות עליהם.",
      subtitle: "הבסיס למערכת העיצוב שלך",
      title: "shadcn/ui",
    },
  },
} satisfies Translations;

export function SeparatorRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  return (
    <div class="flex max-w-sm flex-col gap-4 text-sm" dir={dir}>
      <div class="flex flex-col gap-1.5">
        <div class="leading-none font-medium">{t.title}</div>
        <div class="text-muted-foreground">{t.subtitle}</div>
      </div>
      <Separator />
      <div>{t.description}</div>
    </div>
  );
}

export default SeparatorRtl;
