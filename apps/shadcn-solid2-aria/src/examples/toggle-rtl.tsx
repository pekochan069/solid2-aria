/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/toggle-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BookmarkIcon } from "@lucide/solid";

import { Toggle } from "../registry/ui/toggle";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      label: "إشارة مرجعية",
    },
  },
  en: {
    dir: "ltr",
    values: {
      label: "Bookmark",
    },
  },
  he: {
    dir: "rtl",
    values: {
      label: "סימנייה",
    },
  },
} satisfies Translations;

export function ToggleRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Toggle aria-label="Toggle bookmark" size="sm" variant="outline">
      <BookmarkIcon class="group-aria-pressed/toggle:fill-foreground" />
      {t.label}
    </Toggle>
  );
}

export default ToggleRtl;
