/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/context-menu-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowLeftIcon, ArrowRightIcon, RotateCwIcon } from "@lucide/solid";
import { Pressable } from "@solid2-aria/components";
import type { Selection } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../registry/ui/context-menu";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      back: "رجوع",
      colm: "Colm Tuite",
      createShortcut: "إنشاء اختصار...",
      delete: "حذف",
      developerTools: "أدوات المطور",
      forward: "تقدم",
      longPress: "اضغط مطولاً هنا",
      moreTools: "المزيد من الأدوات",
      nameWindow: "تسمية النافذة...",
      navigation: "التنقل",
      pedro: "Pedro Duarte",
      people: "الأشخاص",
      reload: "إعادة تحميل",
      rightClick: "انقر بزر الماوس الأيمن هنا",
      savePage: "حفظ الصفحة...",
      showBookmarks: "إظهار الإشارات المرجعية",
      showFullUrls: "إظهار عناوين URL الكاملة",
    },
  },
  en: {
    dir: "ltr",
    values: {
      back: "Back",
      colm: "Colm Tuite",
      createShortcut: "Create Shortcut...",
      delete: "Delete",
      developerTools: "Developer Tools",
      forward: "Forward",
      longPress: "Long press here",
      moreTools: "More Tools",
      nameWindow: "Name Window...",
      navigation: "Navigation",
      pedro: "Pedro Duarte",
      people: "People",
      reload: "Reload",
      rightClick: "Right click here",
      savePage: "Save Page...",
      showBookmarks: "Show Bookmarks",
      showFullUrls: "Show Full URLs",
    },
  },
  he: {
    dir: "rtl",
    values: {
      back: "חזור",
      colm: "Colm Tuite",
      createShortcut: "צור קיצור דרך...",
      delete: "מחק",
      developerTools: "כלי מפתח",
      forward: "קדימה",
      longPress: "לחץ לחיצה ארוכה כאן",
      moreTools: "כלים נוספים",
      nameWindow: "שם חלון...",
      navigation: "ניווט",
      pedro: "Pedro Duarte",
      people: "אנשים",
      reload: "רענן",
      rightClick: "לחץ לחיצה ימנית כאן",
      savePage: "שמור עמוד...",
      showBookmarks: "הצג סימניות",
      showFullUrls: "הצג כתובות URL מלאות",
    },
  },
} satisfies Translations;

export function ContextMenuRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");

  const [selectedKeys, setSelectedKeys] = createSignal<Selection>(
    new Set(["bookmarks"])
  );

  const [people, setPeople] = createSignal("pedro");

  return (
    <ContextMenuTrigger>
      <Pressable>
        <div
          role="button"
          class="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm"
        >
          <span class="hidden pointer-fine:inline-block">{t.rightClick}</span>
          <span class="hidden pointer-coarse:inline-block">{t.longPress}</span>
        </div>
      </Pressable>
      <ContextMenu
        class="w-48"
        data-lang={dir === "rtl" ? language : undefined}
      >
        <ContextMenuGroup>
          <ContextMenuSub>
            <ContextMenuSubTrigger>{t.navigation}</ContextMenuSubTrigger>
            <ContextMenuSubContent
              class="w-44"
              data-lang={dir === "rtl" ? language : undefined}
            >
              <ContextMenuGroup>
                <ContextMenuItem>
                  <ArrowLeftIcon />
                  {t.back}
                  <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem isDisabled>
                  <ArrowRightIcon />
                  {t.forward}
                  <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>
                  <RotateCwIcon />
                  {t.reload}
                  <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger>{t.moreTools}</ContextMenuSubTrigger>
            <ContextMenuSubContent
              class="w-44"
              data-lang={dir === "rtl" ? language : undefined}
            >
              <ContextMenuGroup>
                <ContextMenuItem>{t.savePage}</ContextMenuItem>
                <ContextMenuItem>{t.createShortcut}</ContextMenuItem>
                <ContextMenuItem>{t.nameWindow}</ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem>{t.developerTools}</ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem variant="destructive">
                  {t.delete}
                </ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup
          selectionMode="multiple"
          selectedKeys={selectedKeys()}
          onSelectionChange={(value) => {
            setSelectedKeys(value);
          }}
        >
          <ContextMenuItem id="bookmarks">{t.showBookmarks}</ContextMenuItem>
          <ContextMenuItem id="urls">{t.showFullUrls}</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup
          selectionMode="single"
          selectedKeys={[people()]}
          onSelectionChange={(keys) => {
            setPeople(
              keys === "all"
                ? "pedro"
                : String(keys.values().next().value ?? "")
            );
          }}
        >
          <ContextMenuItem id="pedro">{t.pedro}</ContextMenuItem>
          <ContextMenuItem id="colm">{t.colm}</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenu>
    </ContextMenuTrigger>
  );
}

export default ContextMenuRtl;
