/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/textarea-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Field, FieldDescription, FieldLabel } from "../registry/ui/field";
import { Textarea } from "../registry/ui/textarea";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      description: "شاركنا أفكارك حول خدمتنا.",
      label: "التعليقات",
      placeholder: "تعليقاتك تساعدنا على التحسين...",
    },
  },
  en: {
    dir: "ltr",
    values: {
      description: "Share your thoughts about our service.",
      label: "Feedback",
      placeholder: "Your feedback helps us improve...",
    },
  },
  he: {
    dir: "rtl",
    values: {
      description: "שתף את מחשבותיך על השירות שלנו.",
      label: "משוב",
      placeholder: "המשוב שלך עוזר לנו להשתפר...",
    },
  },
} satisfies Translations;

export default function TextareaRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Field class="w-full max-w-xs">
      <FieldLabel for="feedback">{t.label}</FieldLabel>
      <Textarea id="feedback" placeholder={t.placeholder} rows={4} />
      <FieldDescription>{t.description}</FieldDescription>
    </Field>
  );
}
