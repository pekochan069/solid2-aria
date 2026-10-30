/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/dropdown-menu-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CreditCardIcon, SettingsIcon, UserIcon } from "@lucide/solid";
import type { Selection } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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
      account: "الحساب",
      activityBar: "شريط النشاط",
      advanced: "متقدم...",
      billing: "الفوترة",
      bottom: "أسفل",
      calendar: "تقويم",
      chat: "دردشة",
      email: "البريد الإلكتروني",
      inviteUsers: "دعوة المستخدمين",
      left: "يسار",
      logout: "تسجيل الخروج",
      message: "رسالة",
      more: "المزيد",
      newTeam: "فريق جديد",
      open: "افتح القائمة",
      panel: "اللوحة",
      position: "الموضع",
      profile: "الملف الشخصي",
      right: "يمين",
      settings: "الإعدادات",
      statusBar: "شريط الحالة",
      team: "الفريق",
      top: "أعلى",
      view: "عرض",
      webhook: "خطاف ويب",
    },
  },
  en: {
    dir: "ltr",
    values: {
      account: "Account",
      activityBar: "Activity Bar",
      advanced: "Advanced...",
      billing: "Billing",
      bottom: "Bottom",
      calendar: "Calendar",
      chat: "Chat",
      email: "Email",
      inviteUsers: "Invite users",
      left: "Left",
      logout: "Log out",
      message: "Message",
      more: "More",
      newTeam: "New Team",
      open: "Open",
      panel: "Panel",
      position: "Position",
      profile: "Profile",
      right: "Right",
      settings: "Settings",
      statusBar: "Status Bar",
      team: "Team",
      top: "Top",
      view: "View",
      webhook: "Webhook",
    },
  },
  he: {
    dir: "rtl",
    values: {
      account: "חשבון",
      activityBar: "שורת פעילות",
      advanced: "מתקדם...",
      billing: "חיוב",
      bottom: "למטה",
      calendar: "יומן",
      chat: "צ'אט",
      email: "אימייל",
      inviteUsers: "הזמן משתמשים",
      left: "שמאל",
      logout: "התנתק",
      message: "הודעה",
      more: "עוד",
      newTeam: "צוות חדש",
      open: "פתח תפריט",
      panel: "לוח",
      position: "מיקום",
      profile: "פרופיל",
      right: "ימין",
      settings: "הגדרות",
      statusBar: "שורת סטטוס",
      team: "הצוות",
      top: "למעלה",
      view: "תצוגה",
      webhook: "Webhook",
    },
  },
} satisfies Translations;

export function DropdownMenuRtl() {
  const { dir, language, t } = useTranslation(translations, "ar");

  const [selectedKeys, setSelectedKeys] = createSignal<Selection>(
    new Set(["status-bar"])
  );

  const [position, setPosition] = createSignal("bottom");

  return (
    <DropdownMenuTrigger>
      <Button variant="outline">{t.open}</Button>
      <DropdownMenu
        placement={dir === "rtl" ? "bottom end" : "bottom start"}
        class="w-36"
        data-lang={dir === "rtl" ? language : undefined}
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t.account}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              data-lang={dir === "rtl" ? language : undefined}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserIcon />
                  {t.profile}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCardIcon />
                  {t.billing}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon />
                  {t.settings}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t.team}</DropdownMenuLabel>
          <DropdownMenuItem>{t.team}</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t.inviteUsers}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              data-lang={dir === "rtl" ? language : undefined}
            >
              <DropdownMenuItem>{t.email}</DropdownMenuItem>
              <DropdownMenuItem>{t.message}</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t.more}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  data-lang={dir === "rtl" ? language : undefined}
                >
                  <DropdownMenuItem>{t.calendar}</DropdownMenuItem>
                  <DropdownMenuItem>{t.chat}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>{t.webhook}</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t.advanced}</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            {t.newTeam}
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup
          selectionMode="multiple"
          selectedKeys={selectedKeys()}
          onSelectionChange={(value) => {
            setSelectedKeys(value);
          }}
        >
          <DropdownMenuLabel>{t.view}</DropdownMenuLabel>
          <DropdownMenuItem id="status-bar">{t.statusBar}</DropdownMenuItem>
          <DropdownMenuItem id="activity-bar">{t.activityBar}</DropdownMenuItem>
          <DropdownMenuItem id="panel">{t.panel}</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup
          selectionMode="single"
          selectedKeys={[position()]}
          onSelectionChange={(keys) => {
            setPosition(String([...keys][0] ?? ""));
          }}
        >
          <DropdownMenuLabel>{t.position}</DropdownMenuLabel>
          <DropdownMenuItem id="top">{t.top}</DropdownMenuItem>
          <DropdownMenuItem id="bottom">{t.bottom}</DropdownMenuItem>
          <DropdownMenuItem id="right">{t.right}</DropdownMenuItem>
          <DropdownMenuItem id="left">{t.left}</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive">{t.logout}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

export default DropdownMenuRtl;
