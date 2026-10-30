/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/switch-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../registry/ui/field";
import { Switch } from "../registry/ui/switch";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      description:
        "يتم مشاركة التركيز عبر الأجهزة، ويتم إيقاف تشغيله عند مغادرة التطبيق.",
      label: "المشاركة عبر الأجهزة",
    },
  },
  en: {
    dir: "ltr",
    values: {
      description:
        "Focus is shared across devices, and turns off when you leave the app.",
      label: "Share across devices",
    },
  },
  he: {
    dir: "rtl",
    values: {
      description: "המיקוד משותף בין מכשירים, וכבה כשאתה עוזב את האפליקציה.",
      label: "שיתוף בין מכשירים",
    },
  },
} satisfies Translations;

export function SwitchRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Field orientation="horizontal" class="max-w-sm">
      <FieldContent>
        <FieldLabel for="switch-focus-mode-rtl">{t.label}</FieldLabel>
        <FieldDescription>{t.description}</FieldDescription>
      </FieldContent>
      <Switch id="switch-focus-mode-rtl" />
    </Field>
  );
}

export default SwitchRtl;
