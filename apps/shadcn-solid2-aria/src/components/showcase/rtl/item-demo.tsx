/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/item-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BadgeCheckIcon, ChevronRightIcon } from "@lucide/solid";

import { Button } from "../../../registry/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../../../registry/ui/item";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    dir: "rtl" as const,
    enable: "تفعيل",
    twoFactor: "المصادقة الثنائية",
    twoFactorDescription: "التحقق عبر البريد الإلكتروني أو رقم الهاتف.",
    verified: "تم التحقق من ملفك الشخصي.",
  },
  he: {
    dir: "rtl" as const,
    enable: "הפעל",
    twoFactor: "אימות דו-שלבי",
    twoFactorDescription: "אמת באמצעות אימייל או מספר טלפון.",
    verified: "הפרופיל שלך אומת.",
  },
};

export function ItemDemo() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  return (
    <div dir={t().dir} class="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{t().twoFactor}</ItemTitle>
          <ItemDescription class="text-pretty xl:hidden 2xl:block">
            {t().twoFactorDescription}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm">{t().enable}</Button>
        </ItemActions>
      </Item>
      <Item variant="outline" size="sm">
        <ItemMedia>
          <BadgeCheckIcon class="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{t().verified}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4 rtl:rotate-180" />
        </ItemActions>
      </Item>
    </div>
  );
}
