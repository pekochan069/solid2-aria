/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/label-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Checkbox } from "../registry/ui/checkbox";
import { Label } from "../registry/ui/label";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      label: "قبول الشروط والأحكام",
    },
  },
  en: {
    dir: "ltr",
    values: {
      label: "Accept terms and conditions",
    },
  },
  he: {
    dir: "rtl",
    values: {
      label: "קבל תנאים והגבלות",
    },
  },
} satisfies Translations;

export function LabelRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  return (
    <div class="flex gap-2" dir={dir}>
      <Checkbox id="terms-rtl" />
      <Label for="terms-rtl">{t.label}</Label>
    </div>
  );
}

export default LabelRtl;
