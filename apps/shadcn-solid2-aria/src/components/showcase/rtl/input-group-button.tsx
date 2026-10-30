/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/input-group-button.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../registry/ui/input-group";
import { Label } from "../../../registry/ui/label";
import { PopoverTrigger, Popover } from "../../../registry/ui/popover";
import { IconInfoCircle, IconStar } from "./icons";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    currency: "ر.س",
    dir: "rtl" as const,
    favorite: "مفضل",
    info: "معلومات",
    inputLabel: "السعر",
    priceDescription: "سيتم تحويل السعر تلقائياً.",
    priceInfo: "أدخل السعر بالريال السعودي.",
  },
  he: {
    currency: "₪",
    dir: "rtl" as const,
    favorite: "מועדף",
    info: "מידע",
    inputLabel: "מחיר",
    priceDescription: "המחיר יומר אוטומטית.",
    priceInfo: "הזן את המחיר בשקלים.",
  },
};

export function InputGroupButtonExample() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];
  const [isFavorite, setIsFavorite] = createSignal(false);

  return (
    <div dir={t().dir} class="grid w-full max-w-sm gap-6">
      <Label for="input-secure-rtl" class="sr-only">
        {t().inputLabel}
      </Label>
      <InputGroup class="[--radius:9999px]">
        <InputGroupInput id="input-secure-rtl" class="pr-0.5!" />
        <InputGroupAddon>
          <PopoverTrigger>
            <InputGroupButton
              variant="secondary"
              size="icon-xs"
              aria-label={t().info}
            >
              <IconInfoCircle />
            </InputGroupButton>
            <Popover
              crossOffset={10}
              class="flex flex-col gap-1 rounded-xl text-sm"
              data-lang={lang()}
              dir={t().dir}
            >
              <p class="font-medium">{t().priceInfo}</p>
              <p>{t().priceDescription}</p>
            </Popover>
          </PopoverTrigger>
        </InputGroupAddon>
        <InputGroupAddon class="text-muted-foreground">
          {t().currency}
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onPress={() => {
              setIsFavorite(!isFavorite());
            }}
            size="icon-xs"
            aria-label={t().favorite}
          >
            <IconStar
              data-favorite={isFavorite()}
              class="data-[favorite=true]:fill-primary data-[favorite=true]:stroke-primary"
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
