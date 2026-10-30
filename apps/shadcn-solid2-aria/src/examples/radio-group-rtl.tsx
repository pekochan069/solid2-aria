/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/radio-group-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../registry/ui/field";
import { RadioGroup, RadioGroupItem } from "../registry/ui/radio-group";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      comfortable: "مريح",
      comfortableDescription: "مساحة أكبر بين العناصر.",
      compact: "مضغوط",
      compactDescription: "تباعد أدنى للتخطيطات الكثيفة.",
      default: "افتراضي",
      defaultDescription: "تباعد قياسي لمعظم حالات الاستخدام.",
    },
  },
  en: {
    dir: "ltr",
    values: {
      comfortable: "Comfortable",
      comfortableDescription: "More space between elements.",
      compact: "Compact",
      compactDescription: "Minimal spacing for dense layouts.",
      default: "Default",
      defaultDescription: "Standard spacing for most use cases.",
    },
  },
  he: {
    dir: "rtl",
    values: {
      comfortable: "נוח",
      comfortableDescription: "יותר מקום בין האלמנטים.",
      compact: "קומפקטי",
      compactDescription: "ריווח מינימלי לפריסות צפופות.",
      default: "ברירת מחדל",
      defaultDescription: "ריווח סטנדרטי לרוב מקרי השימוש.",
    },
  },
} satisfies Translations;

export function RadioGroupRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <RadioGroup aria-label="Density" defaultValue="comfortable" class="w-fit">
      <Field orientation="horizontal">
        <RadioGroupItem value="default" id="r1-rtl" />
        <FieldContent>
          <FieldLabel for="r1-rtl">{t.default}</FieldLabel>
          <FieldDescription>{t.defaultDescription}</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="comfortable" id="r2-rtl" />
        <FieldContent>
          <FieldLabel for="r2-rtl">{t.comfortable}</FieldLabel>
          <FieldDescription>{t.comfortableDescription}</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="compact" id="r3-rtl" />
        <FieldContent>
          <FieldLabel for="r3-rtl">{t.compact}</FieldLabel>
          <FieldDescription>{t.compactDescription}</FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
  );
}

export default RadioGroupRtl;
