/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/empty-avatar-group.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PlusIcon } from "@lucide/solid";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "../../../registry/ui/avatar";
import { Button } from "../../../registry/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../registry/ui/empty";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    description: "قم بدعوة فريقك للتعاون في هذا المشروع.",
    dir: "rtl" as const,
    invite: "دعوة أعضاء",
    title: "لا يوجد أعضاء في الفريق",
  },
  he: {
    description: "הזמן את הצוות שלך לשתף פעולה בפרויקט זה.",
    dir: "rtl" as const,
    invite: "הזמן חברים",
    title: "אין חברי צוות",
  },
};

export function EmptyAvatarGroup() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  return (
    <Empty class="flex-none border py-10" dir={t().dir}>
      <EmptyHeader>
        <EmptyMedia>
          <AvatarGroup class="grayscale">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/maxleiter.png"
                alt="@maxleiter"
              />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/evilrabbit.png"
                alt="@evilrabbit"
              />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </EmptyMedia>
        <EmptyTitle>{t().title}</EmptyTitle>
        <EmptyDescription>{t().description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">
          <PlusIcon />
          {t().invite}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
