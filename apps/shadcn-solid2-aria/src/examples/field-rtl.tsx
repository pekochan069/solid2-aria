/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/field-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { hasKey } from "../lib/has-key";
import { Button } from "../registry/ui/button";
import { Checkbox } from "../registry/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "../registry/ui/field";
import { Input } from "../registry/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../registry/ui/select";
import { Textarea } from "../registry/ui/textarea";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const months = [
  { label: "01", value: "01" },
  { label: "02", value: "02" },
  { label: "03", value: "03" },
  { label: "04", value: "04" },
  { label: "05", value: "05" },
  { label: "06", value: "06" },
  { label: "07", value: "07" },
  { label: "08", value: "08" },
  { label: "09", value: "09" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
];

const years = [
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
];

const translations = {
  ar: {
    dir: "rtl",
    values: {
      billingAddress: "عنوان الفوترة",
      billingAddressDescription: "عنوان الفوترة المرتبط بطريقة الدفع الخاصة بك",
      cancel: "إلغاء",
      cardNumber: "رقم البطاقة",
      cardNumberDescription: "أدخل رقم البطاقة المكون من 16 رقمًا",
      comments: "تعليقات",
      commentsPlaceholder: "أضف أي تعليقات إضافية",
      cvv: "CVV",
      month: "الشهر",
      month01: "٠١",
      month02: "٠٢",
      month03: "٠٣",
      month04: "٠٤",
      month05: "٠٥",
      month06: "٠٦",
      month07: "٠٧",
      month08: "٠٨",
      month09: "٠٩",
      month10: "١٠",
      month11: "١١",
      month12: "١٢",
      monthPlaceholder: "ش.ش",
      nameOnCard: "الاسم على البطاقة",
      paymentMethod: "طريقة الدفع",
      sameAsShipping: "نفس عنوان الشحن",
      secureTransactions: "جميع المعاملات آمنة ومشفرة",
      submit: "إرسال",
      year: "السنة",
    },
  },
  en: {
    dir: "ltr",
    values: {
      billingAddress: "Billing Address",
      billingAddressDescription:
        "The billing address associated with your payment method",
      cancel: "Cancel",
      cardNumber: "Card Number",
      cardNumberDescription: "Enter your 16-digit card number",
      comments: "Comments",
      commentsPlaceholder: "Add any additional comments",
      cvv: "CVV",
      month: "Month",
      month01: "01",
      month02: "02",
      month03: "03",
      month04: "04",
      month05: "05",
      month06: "06",
      month07: "07",
      month08: "08",
      month09: "09",
      month10: "10",
      month11: "11",
      month12: "12",
      monthPlaceholder: "MM",
      nameOnCard: "Name on Card",
      paymentMethod: "Payment Method",
      sameAsShipping: "Same as shipping address",
      secureTransactions: "All transactions are secure and encrypted",
      submit: "Submit",
      year: "Year",
    },
  },
  he: {
    dir: "rtl",
    values: {
      billingAddress: "כתובת חיוב",
      billingAddressDescription: "כתובת החיוב המשויכת לאמצעי התשלום שלך",
      cancel: "בטל",
      cardNumber: "מספר כרטיס",
      cardNumberDescription: "הזן את מספר הכרטיס בן 16 הספרות שלך",
      comments: "הערות",
      commentsPlaceholder: "הוסף הערות נוספות",
      cvv: "CVV",
      month: "חודש",
      month01: "01",
      month02: "02",
      month03: "03",
      month04: "04",
      month05: "05",
      month06: "06",
      month07: "07",
      month08: "08",
      month09: "09",
      month10: "10",
      month11: "11",
      month12: "12",
      monthPlaceholder: "MM",
      nameOnCard: "שם על הכרטיס",
      paymentMethod: "אמצעי תשלום",
      sameAsShipping: "זהה לכתובת המשלוח",
      secureTransactions: "כל העסקאות מאובטחות ומוצפנות",
      submit: "שלח",
      year: "שנה",
    },
  },
} satisfies Translations;

export function FieldRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  const getMonthLabel = (value: string | null): string => {
    if (value === null) {
      return t.monthPlaceholder;
    }

    const monthKey = `month${value}`;

    return hasKey(t, monthKey) ? t[monthKey] || value : value;
  };

  return (
    <div class="w-full max-w-md py-6" dir={dir}>
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>{t.paymentMethod}</FieldLegend>
            <FieldDescription>{t.secureTransactions}</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel for="checkout-7j9-card-name-43j-rtl">
                  {t.nameOnCard}
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-name-43j-rtl"
                  placeholder="Evil Rabbit"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="checkout-7j9-card-number-uw1-rtl">
                  {t.cardNumber}
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1-rtl"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>{t.cardNumberDescription}</FieldDescription>
              </Field>
              <div class="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel for="checkout-exp-month-ts6-rtl">
                    {t.month}
                  </FieldLabel>
                  <Select placeholder="MM">
                    <SelectTrigger id="checkout-exp-month-ts6-rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          <For each={months}>
                            {(item) => (
                              <SelectItem id={item.value}>
                                {getMonthLabel(item.value)}
                              </SelectItem>
                            )}
                          </For>
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel for="checkout-7j9-exp-year-f59-rtl">
                    {t.year}
                  </FieldLabel>
                  <Select placeholder="YYYY">
                    <SelectTrigger id="checkout-7j9-exp-year-f59-rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          <For each={years}>
                            {(item) => (
                              <SelectItem id={item.value}>
                                {item.label}
                              </SelectItem>
                            )}
                          </For>
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel for="checkout-7j9-cvv-rtl">{t.cvv}</FieldLabel>
                  <Input id="checkout-7j9-cvv-rtl" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>{t.billingAddress}</FieldLegend>
            <FieldDescription>{t.billingAddressDescription}</FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm-rtl"
                  defaultSelected
                />
                <FieldLabel
                  for="checkout-7j9-same-as-shipping-wgm-rtl"
                  class="font-normal"
                >
                  {t.sameAsShipping}
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel for="checkout-7j9-optional-comments-rtl">
                  {t.comments}
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments-rtl"
                  placeholder={t.commentsPlaceholder}
                  class="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">{t.submit}</Button>
            <Button variant="outline" type="button">
              {t.cancel}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

export default FieldRtl;
