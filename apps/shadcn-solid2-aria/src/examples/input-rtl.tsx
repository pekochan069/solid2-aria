/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Field, FieldDescription, FieldLabel } from "../registry/ui/field";
import { Input } from "../registry/ui/input";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      apiKey: "مفتاح API",
      description: "مفتاح API الخاص بك مشفر ومخزن بأمان.",
      placeholder: "sk-...",
    },
  },
  en: {
    dir: "ltr",
    values: {
      apiKey: "API Key",
      description: "Your API key is encrypted and stored securely.",
      placeholder: "sk-...",
    },
  },
  he: {
    dir: "rtl",
    values: {
      apiKey: "מפתח API",
      description: "מפתח ה-API שלך מוצפן ונשמר בצורה מאובטחת.",
      placeholder: "sk-...",
    },
  },
} satisfies Translations;

export function InputRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Field>
      <FieldLabel for="input-rtl-api-key">{t.apiKey}</FieldLabel>
      <Input
        id="input-rtl-api-key"
        type="password"
        placeholder={t.placeholder}
      />
      <FieldDescription>{t.description}</FieldDescription>
    </Field>
  );
}

export default InputRtl;
