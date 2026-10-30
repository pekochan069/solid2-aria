/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/toggle-group-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ToggleGroup, ToggleGroupItem } from "../registry/ui/toggle-group";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      cards: "بطاقات",
      grid: "شبكة",
      list: "قائمة",
    },
  },
  en: {
    dir: "ltr",
    values: {
      cards: "Cards",
      grid: "Grid",
      list: "List",
    },
  },
  he: {
    dir: "rtl",
    values: {
      cards: "כרטיסים",
      grid: "רשת",
      list: "רשימה",
    },
  },
} satisfies Translations;

export function ToggleGroupRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <ToggleGroup variant="outline" defaultSelectedKeys={["list"]}>
      <ToggleGroupItem id="list" aria-label={t.list}>
        {t.list}
      </ToggleGroupItem>
      <ToggleGroupItem id="grid" aria-label={t.grid}>
        {t.grid}
      </ToggleGroupItem>
      <ToggleGroupItem id="cards" aria-label={t.cards}>
        {t.cards}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default ToggleGroupRtl;
