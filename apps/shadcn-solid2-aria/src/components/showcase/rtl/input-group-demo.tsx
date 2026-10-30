/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/input-group-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowUpIcon, Search } from "@lucide/solid";

import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "../../../registry/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "../../../registry/ui/input-group";
import { Separator } from "../../../registry/ui/separator";
import { TooltipTrigger, Tooltip } from "../../../registry/ui/tooltip";
import { IconCheck, IconChevronDown, IconInfoCircle, IconPlus } from "./icons";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    add: "إضافة",
    agent: "وكيل",
    askSearchChat: "اسأل، ابحث أو تحدث...",
    auto: "تلقائي",
    dir: "rtl" as const,
    example: "example.com",
    manual: "يدوي",
    results: "12 نتيجة",
    search: "بحث...",
    send: "إرسال",
    tooltipContent: "هذا محتوى في تلميح.",
    used: "52% مستخدم",
  },
  he: {
    add: "הוסף",
    agent: "סוכן",
    askSearchChat: "שאל, חפש או שוחח...",
    auto: "אוטומטי",
    dir: "rtl" as const,
    example: "example.com",
    manual: "ידני",
    results: "12 תוצאות",
    search: "חיפוש...",
    send: "שלח",
    tooltipContent: "זה תוכן בטולטיפ.",
    used: "52% בשימוש",
  },
};

export function InputGroupDemo() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  return (
    <div dir={t().dir} class="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder={t().search} />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">{t().results}</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder={t().example} />
        <InputGroupAddon align="inline-end">
          <TooltipTrigger>
            <InputGroupButton
              class="rounded-full"
              size="icon-xs"
              aria-label={t().add}
            >
              <IconInfoCircle />
            </InputGroupButton>
            <Tooltip>{t().tooltipContent}</Tooltip>
          </TooltipTrigger>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder={t().askSearchChat} />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="outline"
            class="rounded-full"
            size="icon-xs"
            aria-label={t().add}
          >
            <IconPlus />
          </InputGroupButton>
          <DropdownMenuTrigger>
            <InputGroupButton variant="ghost">
              <IconChevronDown />
            </InputGroupButton>
            <DropdownMenu placement="top">
              <DropdownMenuItem>{t().auto}</DropdownMenuItem>
              <DropdownMenuItem>{t().agent}</DropdownMenuItem>
              <DropdownMenuItem>{t().manual}</DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
          <InputGroupText class="ms-auto">{t().used}</InputGroupText>
          <Separator orientation="vertical" class="h-4!" />
          <InputGroupButton
            variant="default"
            class="rounded-full"
            size="icon-xs"
          >
            <ArrowUpIcon />
            <span class="sr-only">{t().send}</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="shadcn" />
        <InputGroupAddon align="inline-end">
          <div class="bg-primary text-foreground flex size-4 items-center justify-center rounded-full">
            <IconCheck class="size-3 text-white" />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
