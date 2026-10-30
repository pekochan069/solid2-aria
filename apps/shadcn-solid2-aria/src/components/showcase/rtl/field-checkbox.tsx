/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/field-checkbox.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Checkbox } from "../../../registry/ui/checkbox";
import { Field, FieldLabel } from "../../../registry/ui/field";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    dir: "rtl" as const,
    terms: "أوافق على الشروط والأحكام",
  },
  he: {
    dir: "rtl" as const,
    terms: "אני מסכים לתנאים וההגבלות",
  },
};

export function FieldCheckbox() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const dir = () => translations[lang()].dir;
  const terms = () => translations[lang()].terms;

  return (
    <div dir={dir()}>
      <FieldLabel for="checkbox-demo-rtl">
        <Field orientation="horizontal">
          <Checkbox id="checkbox-demo-rtl" defaultSelected />
          <FieldLabel for="checkbox-demo-rtl" class="line-clamp-1">
            {terms()}
          </FieldLabel>
        </Field>
      </FieldLabel>
    </div>
  );
}
