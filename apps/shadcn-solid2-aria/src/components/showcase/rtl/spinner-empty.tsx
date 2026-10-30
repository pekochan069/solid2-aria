/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/spinner-empty.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../../../registry/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../registry/ui/empty";
import { Spinner } from "../../../registry/ui/spinner";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    cancel: "إلغاء",
    description: "يرجى الانتظار بينما نعالج طلبك. لا تقم بتحديث الصفحة.",
    dir: "rtl" as const,
    title: "جارٍ معالجة طلبك",
  },
  he: {
    cancel: "ביטול",
    description: "אנא המתן בזמן שאנו מעבדים את בקשתך. אל תרענן את הדף.",
    dir: "rtl" as const,
    title: "מעבד את הבקשה שלך",
  },
};

export function SpinnerEmpty() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  return (
    <Empty class="w-full border md:p-6" dir={t().dir}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>{t().title}</EmptyTitle>
        <EmptyDescription>{t().description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          {t().cancel}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
