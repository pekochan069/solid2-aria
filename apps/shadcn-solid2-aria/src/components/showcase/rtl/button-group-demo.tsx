/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/button-group-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarPlusIcon,
  ClockIcon,
  ListFilterIcon,
  MailCheckIcon,
  MoreHorizontalIcon,
  TagIcon,
  Trash2Icon,
} from "@lucide/solid";
import { createSignal } from "solid-js";

import { Button } from "../../../registry/ui/button";
import { ButtonGroup } from "../../../registry/ui/button-group";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../../registry/ui/dropdown-menu";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    addToCalendar: "إضافة إلى التقويم",
    addToList: "إضافة إلى القائمة",
    archive: "أرشفة",
    dir: "rtl" as const,
    goBack: "رجوع",
    labelAs: "تصنيف كـ...",
    markAsRead: "تحديد كمقروء",
    moreOptions: "خيارات أخرى",
    other: "أخرى",
    personal: "شخصي",
    report: "إبلاغ",
    snooze: "تأجيل",
    trash: "حذف",
    work: "عمل",
  },
  he: {
    addToCalendar: "הוסף ליומן",
    addToList: "הוסף לרשימה",
    archive: "ארכיון",
    dir: "rtl" as const,
    goBack: "חזור",
    labelAs: "תייג כ...",
    markAsRead: "סמן כנקרא",
    moreOptions: "אפשרויות נוספות",
    other: "אחר",
    personal: "אישי",
    report: "דווח",
    snooze: "נודניק",
    trash: "מחק",
    work: "עבודה",
  },
};

export function ButtonGroupDemo() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];
  const [label, setLabel] = createSignal("personal");

  return (
    <div dir={t().dir}>
      <ButtonGroup>
        <ButtonGroup class="hidden sm:flex">
          <Button variant="outline" size="icon-sm" aria-label={t().goBack}>
            <ArrowLeftIcon class="rtl:rotate-180" />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="sm">
            {t().archive}
          </Button>
          <Button variant="outline" size="sm">
            {t().report}
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="sm">
            {t().snooze}
          </Button>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t().moreOptions}
            >
              <MoreHorizontalIcon />
            </Button>
            <DropdownMenu dir={t().dir} data-lang={lang()} class="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MailCheckIcon />
                  {t().markAsRead}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArchiveIcon />
                  {t().archive}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <ClockIcon />
                  {t().snooze}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarPlusIcon />
                  {t().addToCalendar}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListFilterIcon />
                  {t().addToList}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <TagIcon />
                    {t().labelAs}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    selectionMode="single"
                    selectedKeys={[label()]}
                    placement="left"
                    dir={t().dir}
                    data-lang={lang()}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        id="personal"
                        onAction={() => {
                          setLabel("personal");
                        }}
                      >
                        {t().personal}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        id="work"
                        onAction={() => {
                          setLabel("work");
                        }}
                      >
                        {t().work}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        id="other"
                        onAction={() => {
                          setLabel("other");
                        }}
                      >
                        {t().other}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  {t().trash}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  );
}
