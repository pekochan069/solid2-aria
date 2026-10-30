/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/button-group-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
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

import { Button } from "../registry/ui/button";
import { ButtonGroup } from "../registry/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      addToCalendar: "إضافة إلى التقويم",
      addToList: "إضافة إلى القائمة",
      archive: "أرشفة",
      labelAs: "تصنيف كـ...",
      markAsRead: "وضع علامة كمقروء",
      other: "آخر",
      personal: "شخصي",
      report: "تقرير",
      snooze: "تأجيل",
      trash: "سلة المهملات",
      work: "عمل",
    },
  },
  en: {
    dir: "ltr",
    values: {
      addToCalendar: "Add to Calendar",
      addToList: "Add to List",
      archive: "Archive",
      labelAs: "Label As...",
      markAsRead: "Mark as Read",
      other: "Other",
      personal: "Personal",
      report: "Report",
      snooze: "Snooze",
      trash: "Trash",
      work: "Work",
    },
  },
  he: {
    dir: "rtl",
    values: {
      addToCalendar: "הוסף ליומן",
      addToList: "הוסף לרשימה",
      archive: "ארכיון",
      labelAs: "תייג כ...",
      markAsRead: "סמן כנקרא",
      other: "אחר",
      personal: "אישי",
      report: "דוח",
      snooze: "דחה",
      trash: "פח",
      work: "עבודה",
    },
  },
} satisfies Translations;

export function ButtonGroupRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");
  const [label, setLabel] = createSignal("personal");

  return (
    <div dir={dir}>
      <ButtonGroup>
        <ButtonGroup class="hidden sm:flex">
          <Button variant="outline" size="icon" aria-label="Go Back">
            <ArrowLeftIcon class="rtl:rotate-180" />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">{t.archive}</Button>
          <Button variant="outline">{t.report}</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">{t.snooze}</Button>
          <DropdownMenuTrigger>
            <Button variant="outline" size="icon" aria-label="More Options">
              <MoreHorizontalIcon />
            </Button>
            <DropdownMenu
              placement={dir === "rtl" ? "bottom start" : "bottom end"}
              data-lang={dir === "rtl" ? language : undefined}
              class="w-40"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MailCheckIcon />
                  {t.markAsRead}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArchiveIcon />
                  {t.archive}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <ClockIcon />
                  {t.snooze}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarPlusIcon />
                  {t.addToCalendar}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListFilterIcon />
                  {t.addToList}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <TagIcon />
                    {t.labelAs}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    data-lang={dir === "rtl" ? language : undefined}
                    selectionMode="single"
                    selectedKeys={[label()]}
                    onSelectionChange={(keys) => {
                      setLabel(String([...keys][0] ?? ""));
                    }}
                  >
                    <DropdownMenuItem id="personal">
                      {t.personal}
                    </DropdownMenuItem>
                    <DropdownMenuItem id="work">{t.work}</DropdownMenuItem>
                    <DropdownMenuItem id="other">{t.other}</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  {t.trash}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  );
}

export default ButtonGroupRtl;
