/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/table-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../registry/ui/table";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      amount: "المبلغ",
      bankTransfer: "تحويل بنكي",
      caption: "قائمة بفواتيرك الأخيرة.",
      creditCard: "بطاقة ائتمانية",
      invoice: "الفاتورة",
      method: "الطريقة",
      paid: "مدفوع",
      paypal: "PayPal",
      pending: "قيد الانتظار",
      status: "الحالة",
      total: "المجموع",
      unpaid: "غير مدفوع",
    },
  },
  en: {
    dir: "ltr",
    values: {
      amount: "Amount",
      bankTransfer: "Bank Transfer",
      caption: "A list of your recent invoices.",
      creditCard: "Credit Card",
      invoice: "Invoice",
      method: "Method",
      paid: "Paid",
      paypal: "PayPal",
      pending: "Pending",
      status: "Status",
      total: "Total",
      unpaid: "Unpaid",
    },
  },
  he: {
    dir: "rtl",
    values: {
      amount: "סכום",
      bankTransfer: "העברה בנקאית",
      caption: "רשימת החשבוניות האחרונות שלך.",
      creditCard: "כרטיס אשראי",
      invoice: "חשבונית",
      method: "שיטה",
      paid: "שולם",
      paypal: "PayPal",
      pending: "ממתין",
      status: "סטטוס",
      total: 'סה"כ',
      unpaid: "לא שולם",
    },
  },
} satisfies Translations;

const invoices = [
  {
    invoice: "INV001",
    paymentMethod: "creditCard" as const,
    paymentStatus: "paid" as const,
    totalAmount: "$250.00",
  },
  {
    invoice: "INV002",
    paymentMethod: "paypal" as const,
    paymentStatus: "pending" as const,
    totalAmount: "$150.00",
  },
  {
    invoice: "INV003",
    paymentMethod: "bankTransfer" as const,
    paymentStatus: "unpaid" as const,
    totalAmount: "$350.00",
  },
  {
    invoice: "INV004",
    paymentMethod: "creditCard" as const,
    paymentStatus: "paid" as const,
    totalAmount: "$450.00",
  },
  {
    invoice: "INV005",
    paymentMethod: "paypal" as const,
    paymentStatus: "paid" as const,
    totalAmount: "$550.00",
  },
  {
    invoice: "INV006",
    paymentMethod: "bankTransfer" as const,
    paymentStatus: "pending" as const,
    totalAmount: "$200.00",
  },
  {
    invoice: "INV007",
    paymentMethod: "creditCard" as const,
    paymentStatus: "unpaid" as const,
    totalAmount: "$300.00",
  },
];

export function TableRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <figure class="w-full">
      <Table aria-label={t.caption}>
        <TableHeader>
          <TableHead isRowHeader class="w-[100px]">
            {t.invoice}
          </TableHead>
          <TableHead>{t.status}</TableHead>
          <TableHead>{t.method}</TableHead>
          <TableHead class="text-right">{t.amount}</TableHead>
        </TableHeader>
        <TableBody>
          {
            <For each={invoices}>
              {(invoice) => (
                <TableRow>
                  <TableCell class="font-medium">{invoice.invoice}</TableCell>
                  <TableCell>{t[invoice.paymentStatus]}</TableCell>
                  <TableCell>{t[invoice.paymentMethod]}</TableCell>
                  <TableCell class="text-right">
                    {invoice.totalAmount}
                  </TableCell>
                </TableRow>
              )}
            </For>
          }
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>{t.total}</TableCell>
            <TableCell class="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <TableCaption>{t.caption}</TableCaption>
    </figure>
  );
}

export default TableRtl;
