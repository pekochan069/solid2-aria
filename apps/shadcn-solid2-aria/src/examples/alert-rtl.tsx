/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/alert-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckCircle2Icon, InfoIcon } from "@lucide/solid";
import { For } from "solid-js";

import { Alert, AlertDescription, AlertTitle } from "../registry/ui/alert";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      featureDescription:
        "لقد أضفنا دعم الوضع الداكن. يمكنك تفعيله في إعدادات حسابك.",
      featureTitle: "ميزة جديدة متاحة",
      paymentDescription:
        "تمت معالجة دفعتك البالغة 29.99 دولارًا. تم إرسال إيصال إلى عنوان بريدك الإلكتروني.",
      paymentTitle: "تم الدفع بنجاح",
    },
  },
  en: {
    dir: "ltr",
    values: {
      featureDescription:
        "We've added dark mode support. You can enable it in your account settings.",
      featureTitle: "New feature available",
      paymentDescription:
        "Your payment of $29.99 has been processed. A receipt has been sent to your email address.",
      paymentTitle: "Payment successful",
    },
  },
  he: {
    dir: "rtl",
    values: {
      featureDescription:
        "הוספנו תמיכה במצב כהה. אתה יכול להפעיל אותו בהגדרות החשבון שלך.",
      featureTitle: "תכונה חדשה זמינה",
      paymentDescription:
        "התשלום שלך בסך 29.99 דולר עובד. קבלה נשלחה לכתובת האימייל שלך.",
      paymentTitle: "התשלום בוצע בהצלחה",
    },
  },
} satisfies Translations;

const alerts = [
  {
    descriptionKey: "paymentDescription" as const,
    icon: CheckCircle2Icon,
    titleKey: "paymentTitle" as const,
  },
  {
    descriptionKey: "featureDescription" as const,
    icon: InfoIcon,
    titleKey: "featureTitle" as const,
  },
] as const;

export function AlertRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  return (
    <div class="grid w-full max-w-md items-start gap-4" dir={dir}>
      {
        <For each={alerts}>
          {(alert, _index) => {
            const Icon = alert.icon;

            return (
              <Alert>
                <Icon />
                <AlertTitle>{t[alert.titleKey]}</AlertTitle>
                <AlertDescription>{t[alert.descriptionKey]}</AlertDescription>
              </Alert>
            );
          }}
        </For>
      }
    </div>
  );
}

export default AlertRtl;
