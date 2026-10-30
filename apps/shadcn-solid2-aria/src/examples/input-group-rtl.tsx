/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-group-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Search } from "@lucide/solid";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../registry/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "../registry/ui/input-group";
import { Spinner } from "../registry/ui/spinner";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      characterCount: "٠/٢٨٠",
      placeholder: "بحث...",
      post: "نشر",
      results: "١٢ نتيجة",
      saving: "جاري الحفظ...",
      savingChanges: "جاري حفظ التغييرات...",
      searching: "جاري البحث...",
      textareaDescription: "تذييل موضع أسفل منطقة النص.",
      textareaLabel: "منطقة النص",
      textareaPlaceholder: "اكتب تعليقًا...",
    },
  },
  en: {
    dir: "ltr",
    values: {
      characterCount: "0/280",
      placeholder: "Search...",
      post: "Post",
      results: "12 results",
      saving: "Saving...",
      savingChanges: "Saving changes...",
      searching: "Searching...",
      textareaDescription: "Footer positioned below the textarea.",
      textareaLabel: "Textarea",
      textareaPlaceholder: "Write a comment...",
    },
  },
  he: {
    dir: "rtl",
    values: {
      characterCount: "0/280",
      placeholder: "חפש...",
      post: "פרסם",
      results: "12 תוצאות",
      saving: "שומר...",
      savingChanges: "שומר שינויים...",
      searching: "מחפש...",
      textareaDescription: "כותרת תחתונה ממוקמת מתחת לאזור הטקסט.",
      textareaLabel: "אזור טקסט",
      textareaPlaceholder: "כתוב תגובה...",
    },
  },
} satisfies Translations;

export function InputGroupRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <div class="grid w-full max-w-sm gap-6">
      <InputGroup class="max-w-xs">
        <InputGroupInput placeholder={t.placeholder} />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">{t.results}</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder={t.searching} />
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder={t.savingChanges} />
        <InputGroupAddon align="inline-end">
          <InputGroupText>{t.saving}</InputGroupText>
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <FieldGroup class="max-w-sm">
        <Field>
          <FieldLabel for="rtl-textarea">{t.textareaLabel}</FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="rtl-textarea"
              placeholder={t.textareaPlaceholder}
            />
            <InputGroupAddon align="block-end">
              <InputGroupText>{t.characterCount}</InputGroupText>
              <InputGroupButton variant="default" size="sm" class="ms-auto">
                {t.post}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>{t.textareaDescription}</FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  );
}

export default InputGroupRtl;
