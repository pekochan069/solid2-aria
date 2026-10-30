/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/sheet-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../registry/ui/button";
import { Field, FieldGroup, FieldLabel } from "../registry/ui/field";
import { Input } from "../registry/ui/input";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../registry/ui/sheet";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      close: "إغلاق",
      description:
        "قم بإجراء تغييرات على ملفك الشخصي هنا. انقر حفظ عند الانتهاء.",
      editProfile: "تعديل الملف الشخصي",
      name: "الاسم",
      open: "فتح",
      save: "حفظ التغييرات",
      username: "اسم المستخدم",
    },
  },
  en: {
    dir: "ltr",
    values: {
      close: "Close",
      description:
        "Make changes to your profile here. Click save when you're done.",
      editProfile: "Edit profile",
      name: "Name",
      open: "Open",
      save: "Save changes",
      username: "Username",
    },
  },
  he: {
    dir: "rtl",
    values: {
      close: "סגור",
      description: "בצע שינויים בפרופיל שלך כאן. לחץ שמור כשתסיים.",
      editProfile: "עריכת פרופיל",
      name: "שם",
      open: "פתח",
      save: "שמור שינויים",
      username: "שם משתמש",
    },
  },
} satisfies Translations;

export function SheetRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");

  return (
    <SheetTrigger>
      <Button variant="outline">{t.open}</Button>
      <Sheet
        side={dir === "rtl" ? "left" : "right"}
        data-lang={dir === "rtl" ? language : undefined}
      >
        <SheetHeader>
          <SheetTitle>{t.editProfile}</SheetTitle>
          <SheetDescription>{t.description}</SheetDescription>
        </SheetHeader>
        <FieldGroup class="px-4">
          <Field>
            <FieldLabel for="sheet-rtl-name">{t.name}</FieldLabel>
            <Input id="sheet-rtl-name" defaultValue="Pedro Duarte" />
          </Field>
          <Field>
            <FieldLabel for="sheet-rtl-username">{t.username}</FieldLabel>
            <Input id="sheet-rtl-username" defaultValue="peduarte" />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button type="submit">{t.save}</Button>
          <SheetClose variant="outline">{t.close}</SheetClose>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}

export default SheetRtl;
