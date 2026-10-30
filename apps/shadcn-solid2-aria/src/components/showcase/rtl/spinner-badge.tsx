/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/spinner-badge.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Badge } from "../../../registry/ui/badge";
import { Spinner } from "../../../registry/ui/spinner";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    dir: "rtl" as const,
    loading: "جارٍ التحميل",
    syncing: "جارٍ المزامنة",
    updating: "جارٍ التحديث",
  },
  he: {
    dir: "rtl" as const,
    loading: "טוען",
    syncing: "מסנכרן",
    updating: "מעדכן",
  },
};

export function SpinnerBadge() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  return (
    <div dir={t().dir} class="flex items-center gap-2">
      <Badge>
        <Spinner />
        {t().syncing}
      </Badge>
      <Badge variant="secondary">
        <Spinner />
        {t().updating}
      </Badge>
      <Badge variant="outline">
        <Spinner />
        {t().loading}
      </Badge>
    </div>
  );
}
