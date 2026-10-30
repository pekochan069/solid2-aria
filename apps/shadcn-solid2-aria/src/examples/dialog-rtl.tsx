/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/dialog-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../registry/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../registry/ui/dialog";
import { Field, FieldGroup } from "../registry/ui/field";
import { Input } from "../registry/ui/input";
import { Label } from "../registry/ui/label";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      cancel: "إلغاء",
      description:
        "قم بإجراء تغييرات على ملفك الشخصي هنا. انقر فوق حفظ عند الانتهاء.",
      editProfile: "تعديل الملف الشخصي",
      name: "الاسم",
      openDialog: "فتح الحوار",
      saveChanges: "حفظ التغييرات",
      username: "اسم المستخدم",
    },
  },
  en: {
    dir: "ltr",
    values: {
      cancel: "Cancel",
      description:
        "Make changes to your profile here. Click save when you're done.",
      editProfile: "Edit profile",
      name: "Name",
      openDialog: "Open Dialog",
      saveChanges: "Save changes",
      username: "Username",
    },
  },
  he: {
    dir: "rtl",
    values: {
      cancel: "בטל",
      description: "בצע שינויים בפרופיל שלך כאן. לחץ על שמור כשתסיים.",
      editProfile: "ערוך פרופיל",
      name: "שם",
      openDialog: "פתח דיאלוג",
      saveChanges: "שמור שינויים",
      username: "שם משתמש",
    },
  },
} satisfies Translations;

export function DialogRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");

  return (
    <DialogTrigger>
      <form>
        <Button variant="outline">{t.openDialog}</Button>
        <Dialog
          class="sm:max-w-sm"
          data-lang={dir === "rtl" ? language : undefined}
        >
          <DialogHeader>
            <DialogTitle>{t.editProfile}</DialogTitle>
            <DialogDescription>{t.description}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label for="name-1">{t.name}</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </Field>
            <Field>
              <Label for="username-1">{t.username}</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose variant="outline">{t.cancel}</DialogClose>
            <Button type="submit">{t.saveChanges}</Button>
          </DialogFooter>
        </Dialog>
      </form>
    </DialogTrigger>
  );
}

export default DialogRtl;
