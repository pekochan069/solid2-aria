/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/collapsible-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronsUpDown } from "@lucide/solid";
import { createSignal } from "solid-js";

import { Button } from "../registry/ui/button";
import { Collapsible, CollapsibleContent } from "../registry/ui/collapsible";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      address: "100 Market St, San Francisco",
      items: "العناصر",
      itemsDescription: "2x سماعات الاستوديو",
      orderNumber: "الطلب #4189",
      shipped: "تم الشحن",
      shippingAddress: "عنوان الشحن",
      status: "الحالة",
    },
  },
  en: {
    dir: "ltr",
    values: {
      address: "100 Market St, San Francisco",
      items: "Items",
      itemsDescription: "2x Studio Headphones",
      orderNumber: "Order #4189",
      shipped: "Shipped",
      shippingAddress: "Shipping address",
      status: "Status",
    },
  },
  he: {
    dir: "rtl",
    values: {
      address: "100 Market St, San Francisco",
      items: "פריטים",
      itemsDescription: "2x אוזניות סטודיו",
      orderNumber: "הזמנה #4189",
      shipped: "נשלח",
      shippingAddress: "כתובת משלוח",
      status: "סטטוס",
    },
  },
} satisfies Translations;

export function CollapsibleRtl() {
  const { t } = useTranslation(translations, "ar");
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <Collapsible
      isExpanded={isOpen()}
      onExpandedChange={(value) => {
        setIsOpen(value);
      }}
      class="flex w-[350px] flex-col gap-2"
    >
      <div class="flex items-center justify-between gap-4 px-4">
        <h4 class="text-sm font-semibold">{t.orderNumber}</h4>
        <Button slot="trigger" variant="ghost" size="icon" class="size-8">
          <ChevronsUpDown />
          <span class="sr-only">Toggle details</span>
        </Button>
      </div>
      <div class="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
        <span class="text-muted-foreground">{t.status}</span>
        <span class="font-medium">{t.shipped}</span>
      </div>
      <CollapsibleContent>
        <div class="flex flex-col gap-2">
          <div class="rounded-md border px-4 py-2 text-sm">
            <p class="font-medium">{t.shippingAddress}</p>
            <p class="text-muted-foreground">{t.address}</p>
          </div>
          <div class="rounded-md border px-4 py-2 text-sm">
            <p class="font-medium">{t.items}</p>
            <p class="text-muted-foreground">{t.itemsDescription}</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default CollapsibleRtl;
