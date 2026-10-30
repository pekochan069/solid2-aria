/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/alert-dialog-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BluetoothIcon } from "@lucide/solid";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../registry/ui/alert-dialog";
import { Button } from "../registry/ui/button";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      allow: "السماح",
      cancel: "إلغاء",
      continue: "متابعة",
      description:
        "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك نهائيًا من خوادمنا.",
      dontAllow: "عدم السماح",
      showDialog: "إظهار الحوار",
      showDialogSm: "إظهار الحوار (صغير)",
      smallDescription: "هل تريد السماح لملحق USB بالاتصال بهذا الجهاز؟",
      smallTitle: "السماح للملحق بالاتصال؟",
      title: "هل أنت متأكد تمامًا؟",
    },
  },
  en: {
    dir: "ltr",
    values: {
      allow: "Allow",
      cancel: "Cancel",
      continue: "Continue",
      description:
        "This action cannot be undone. This will permanently delete your account from our servers.",
      dontAllow: "Don't allow",
      showDialog: "Show Dialog",
      showDialogSm: "Show Dialog (sm)",
      smallDescription:
        "Do you want to allow the USB accessory to connect to this device?",
      smallTitle: "Allow accessory to connect?",
      title: "Are you absolutely sure?",
    },
  },
  he: {
    dir: "rtl",
    values: {
      allow: "אפשר",
      cancel: "ביטול",
      continue: "המשך",
      description:
        "פעולה זו לא ניתנת לביטול. זה ימחק לצמיתות את החשבון שלך מהשרתים שלנו.",
      dontAllow: "אל תאפשר",
      showDialog: "הצג דיאלוג",
      showDialogSm: "הצג דיאלוג (קטן)",
      smallDescription: "האם אתה רוצה לאפשר להתקן USB להתחבר למכשיר זה?",
      smallTitle: "לאפשר להתקן להתחבר?",
      title: "האם אתה בטוח לחלוטין?",
    },
  },
} satisfies Translations;

export function AlertDialogRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");

  return (
    <div class="flex gap-4" dir={dir}>
      <AlertDialogTrigger>
        <Button variant="outline">{t.showDialog}</Button>
        <AlertDialog data-lang={dir === "rtl" ? language : undefined}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.title}</AlertDialogTitle>
            <AlertDialogDescription>{t.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction>{t.continue}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialog>
      </AlertDialogTrigger>
      <AlertDialogTrigger>
        <Button variant="outline">{t.showDialogSm}</Button>
        <AlertDialog size="sm" data-lang={dir === "rtl" ? language : undefined}>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <BluetoothIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>{t.smallTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.smallDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.dontAllow}</AlertDialogCancel>
            <AlertDialogAction>{t.allow}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialog>
      </AlertDialogTrigger>
    </div>
  );
}

export default AlertDialogRtl;
