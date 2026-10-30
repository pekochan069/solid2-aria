/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/field-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../../../registry/ui/button";
import { Checkbox } from "../../../registry/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "../../../registry/ui/field";
import { Input } from "../../../registry/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../registry/ui/select";
import { Textarea } from "../../../registry/ui/textarea";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    billingAddress: "عنوان الفواتير",
    billingDescription: "عنوان الفواتير المرتبط بطريقة الدفع الخاصة بك",
    cancel: "إلغاء",
    cardDescription: "أدخل رقمك المكون من 16 رقمًا.",
    cardNumber: "رقم البطاقة",
    comments: "تعليقات",
    commentsPlaceholder: "أضف أي تعليقات إضافية",
    cvv: "رمز الأمان",
    dir: "rtl" as const,
    locale: "ar-SA",
    month: "الشهر",
    nameOnCard: "الاسم على البطاقة",
    namePlaceholder: "أحمد محمد",
    paymentMethod: "طريقة الدفع",
    sameAsShipping: "نفس عنوان الشحن",
    secureEncrypted: "جميع المعاملات آمنة ومشفرة",
    submit: "إرسال",
    year: "السنة",
  },
  he: {
    billingAddress: "כתובת לחיוב",
    billingDescription: "כתובת החיוב המשויכת לאמצעי התשלום שלך",
    cancel: "ביטול",
    cardDescription: "הזן את המספר בן 16 הספרות שלך.",
    cardNumber: "מספר כרטיס",
    comments: "הערות",
    commentsPlaceholder: "הוסף הערות נוספות",
    cvv: "קוד אבטחה",
    dir: "rtl" as const,
    locale: "he-IL",
    month: "חודש",
    nameOnCard: "שם על הכרטיס",
    namePlaceholder: "ישראל ישראלי",
    paymentMethod: "אמצעי תשלום",
    sameAsShipping: "זהה לכתובת המשלוח",
    secureEncrypted: "כל העסקאות מאובטחות ומוצפנות",
    submit: "שלח",
    year: "שנה",
  },
};

function formatCardNumber(locale: string) {
  const formatter = new Intl.NumberFormat(locale, { useGrouping: false });

  return `${formatter.format(1234)} ${formatter.format(5678)} ${formatter.format(9012)} ${formatter.format(3456)}`;
}

function formatCvv(locale: string) {
  return new Intl.NumberFormat(locale, { useGrouping: false }).format(123);
}

function getMonths(locale: string) {
  const formatter = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return Array.from({ length: 12 }, (_, i) => {
    const value = String(i + 1).padStart(2, "0");

    return { label: formatter.format(i + 1), value };
  });
}

function getYears(locale: string) {
  const formatter = new Intl.NumberFormat(locale, { useGrouping: false });

  return Array.from({ length: 6 }, (_, i) => {
    const year = 2024 + i;

    return { label: formatter.format(year), value: String(year) };
  });
}

export function FieldDemo() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];
  const months = () => getMonths(t().locale);
  const years = () => getYears(t().locale);
  const cardPlaceholder = () => formatCardNumber(t().locale);
  const cvvPlaceholder = () => formatCvv(t().locale);

  return (
    <div dir={t().dir} class="w-full max-w-md rounded-lg border p-6">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>{t().paymentMethod}</FieldLegend>
            <FieldDescription>{t().secureEncrypted}</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel for="rtl-card-name">{t().nameOnCard}</FieldLabel>
                <Input
                  id="rtl-card-name"
                  placeholder={t().namePlaceholder}
                  required
                />
              </Field>
              <div class="grid grid-cols-3 gap-4">
                <Field class="col-span-2">
                  <FieldLabel for="rtl-card-number">
                    {t().cardNumber}
                  </FieldLabel>
                  <Input
                    id="rtl-card-number"
                    placeholder={cardPlaceholder()}
                    required
                  />
                  <FieldDescription>{t().cardDescription}</FieldDescription>
                </Field>
                <Field class="col-span-1">
                  <FieldLabel for="rtl-cvv">{t().cvv}</FieldLabel>
                  <Input id="rtl-cvv" placeholder={cvvPlaceholder()} required />
                </Field>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel for="rtl-exp-month">{t().month}</FieldLabel>
                  <Select defaultValue="" placeholder="MM">
                    <SelectTrigger id="rtl-exp-month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent data-lang={lang()} dir={t().dir}>
                      <SelectGroup>
                        <For each={months()}>
                          {(item) => (
                            <SelectItem id={item.value}>
                              {item.label}
                            </SelectItem>
                          )}
                        </For>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel for="rtl-exp-year">{t().year}</FieldLabel>
                  <Select defaultValue="" placeholder="YYYY">
                    <SelectTrigger id="rtl-exp-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent data-lang={lang()} dir={t().dir}>
                      <SelectGroup>
                        <For each={years()}>
                          {(item) => (
                            <SelectItem id={item.value}>
                              {item.label}
                            </SelectItem>
                          )}
                        </For>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>{t().billingAddress}</FieldLegend>
            <FieldDescription>{t().billingDescription}</FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="rtl-same-as-shipping" defaultSelected />
                <FieldLabel for="rtl-same-as-shipping" class="font-normal">
                  {t().sameAsShipping}
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel for="rtl-comments">{t().comments}</FieldLabel>
                <Textarea
                  id="rtl-comments"
                  placeholder={t().commentsPlaceholder}
                  class="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">{t().submit}</Button>
            <Button variant="outline" type="button">
              {t().cancel}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
