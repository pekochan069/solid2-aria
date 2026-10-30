/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/empty-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  FolderCodeIcon as IconFolderCode,
  ArrowUpRightIcon,
} from "@lucide/solid";

import { Button, LinkButton } from "../registry/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../registry/ui/empty";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      createProject: "إنشاء مشروع",
      description: "لم تقم بإنشاء أي مشاريع بعد. ابدأ بإنشاء مشروعك الأول.",
      importProject: "استيراد مشروع",
      learnMore: "تعرف على المزيد",
      title: "لا توجد مشاريع بعد",
    },
  },
  en: {
    dir: "ltr",
    values: {
      createProject: "Create Project",
      description:
        "You haven't created any projects yet. Get started by creating your first project.",
      importProject: "Import Project",
      learnMore: "Learn More",
      title: "No Projects Yet",
    },
  },
  he: {
    dir: "rtl",
    values: {
      createProject: "צור פרויקט",
      description:
        "עדיין לא יצרת פרויקטים. התחל על ידי יצירת הפרויקט הראשון שלך.",
      importProject: "ייבא פרויקט",
      learnMore: "למד עוד",
      title: "אין פרויקטים עדיין",
    },
  },
} satisfies Translations;

export function EmptyRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>{t.title}</EmptyTitle>
        <EmptyDescription>{t.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent class="flex-row justify-center gap-2">
        <Button>{t.createProject}</Button>
        <Button variant="outline">{t.importProject}</Button>
      </EmptyContent>
      <LinkButton
        href="#"
        variant="link"
        class="text-muted-foreground"
        size="sm"
      >
        {t.learnMore}{" "}
        <ArrowUpRightIcon class="rtl:rotate-270" data-icon="inline-end" />
      </LinkButton>
    </Empty>
  );
}

export default EmptyRtl;
