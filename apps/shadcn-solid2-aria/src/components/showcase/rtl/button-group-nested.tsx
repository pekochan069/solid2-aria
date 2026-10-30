/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/button-group-nested.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowLeftIcon, ArrowRightIcon } from "@lucide/solid";

import { Button } from "../../../registry/ui/button";
import { ButtonGroup } from "../../../registry/ui/button-group";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    dir: "rtl" as const,
    locale: "ar-SA",
    next: "التالي",
    previous: "السابق",
  },
  he: {
    dir: "rtl" as const,
    locale: "he-IL",
    next: "הבא",
    previous: "הקודם",
  },
};

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function ButtonGroupNested() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  return (
    <ButtonGroup dir={t().dir}>
      <ButtonGroup>
        <Button variant="outline" size="sm">
          {formatNumber(1, t().locale)}
        </Button>
        <Button variant="outline" size="sm">
          {formatNumber(2, t().locale)}
        </Button>
        <Button variant="outline" size="sm">
          {formatNumber(3, t().locale)}
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon-sm" aria-label={t().previous}>
          <ArrowLeftIcon class="rtl:rotate-180" />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label={t().next}>
          <ArrowRightIcon class="rtl:rotate-180" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
