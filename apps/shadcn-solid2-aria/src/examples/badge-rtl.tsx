/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/badge-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BadgeCheck, BookmarkIcon } from "@lucide/solid";

import { Badge } from "../registry/ui/badge";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      badge: "شارة",
      bookmark: "إشارة مرجعية",
      destructive: "مدمر",
      outline: "مخطط",
      secondary: "ثانوي",
      verified: "متحقق",
    },
  },
  en: {
    dir: "ltr",
    values: {
      badge: "Badge",
      bookmark: "Bookmark",
      destructive: "Destructive",
      outline: "Outline",
      secondary: "Secondary",
      verified: "Verified",
    },
  },
  he: {
    dir: "rtl",
    values: {
      badge: "תג",
      bookmark: "סימנייה",
      destructive: "הרסני",
      outline: "קווי מתאר",
      secondary: "משני",
      verified: "מאומת",
    },
  },
} satisfies Translations;

export function BadgeRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  return (
    <div class="flex w-full flex-wrap justify-center gap-2" dir={dir}>
      <Badge>{t.badge}</Badge>
      <Badge variant="secondary">{t.secondary}</Badge>
      <Badge variant="destructive">{t.destructive}</Badge>
      <Badge variant="outline">{t.outline}</Badge>
      <Badge variant="secondary">
        <BadgeCheck data-icon="inline-start" />
        {t.verified}
      </Badge>
      <Badge variant="outline">
        {t.bookmark}
        <BookmarkIcon data-icon="inline-end" />
      </Badge>
    </div>
  );
}

export default BadgeRtl;
