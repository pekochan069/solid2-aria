/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/item-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BadgeCheckIcon, ChevronRightIcon } from "@lucide/solid";

import { Button } from "../registry/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../registry/ui/item";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      action: "إجراء",
      basicItem: "عنصر أساسي",
      basicItemDesc: "عنصر بسيط يحتوي على عنوان ووصف.",
      verifiedTitle: "تم التحقق من ملفك الشخصي.",
    },
  },
  en: {
    dir: "ltr",
    values: {
      action: "Action",
      basicItem: "Basic Item",
      basicItemDesc: "A simple item with title and description.",
      verifiedTitle: "Your profile has been verified.",
    },
  },
  he: {
    dir: "rtl",
    values: {
      action: "פעולה",
      basicItem: "פריט בסיסי",
      basicItemDesc: "פריט פשוט עם כותרת ותיאור.",
      verifiedTitle: "הפרופיל שלך אומת.",
    },
  },
} satisfies Translations;

export function ItemRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  return (
    <div class="flex w-full max-w-md flex-col gap-6" dir={dir}>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{t.basicItem}</ItemTitle>
          <ItemDescription>{t.basicItemDesc}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            {t.action}
          </Button>
        </ItemActions>
      </Item>
      <Item href="#" variant="outline" size="sm">
        <ItemMedia>
          <BadgeCheckIcon class="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{t.verifiedTitle}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4" />
        </ItemActions>
      </Item>
    </div>
  );
}

export default ItemRtl;
