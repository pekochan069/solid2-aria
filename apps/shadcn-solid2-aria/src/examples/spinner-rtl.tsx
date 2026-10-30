/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/spinner-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Item, ItemContent, ItemMedia, ItemTitle } from "../registry/ui/item";
import { Spinner } from "../registry/ui/spinner";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      amount: "١٠٠.٠٠ دولار",
      title: "جاري معالجة الدفع...",
    },
  },
  en: {
    dir: "ltr",
    values: {
      amount: "$100.00",
      title: "Processing payment...",
    },
  },
  he: {
    dir: "rtl",
    values: {
      amount: "$100.00",
      title: "מעבד תשלום...",
    },
  },
} satisfies Translations;

export function SpinnerRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  return (
    <div class="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]" dir={dir}>
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle class="line-clamp-1">{t.title}</ItemTitle>
        </ItemContent>
        <ItemContent class="flex-none justify-end">
          <span class="text-sm tabular-nums">{t.amount}</span>
        </ItemContent>
      </Item>
    </div>
  );
}

export default SpinnerRtl;
