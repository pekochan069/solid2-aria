/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/button-group-popover.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BotIcon, ChevronDownIcon } from "@lucide/solid";

import { Button } from "../../../registry/ui/button";
import { ButtonGroup } from "../../../registry/ui/button-group";
import { PopoverTrigger, Popover } from "../../../registry/ui/popover";
import { Separator } from "../../../registry/ui/separator";
import { Textarea } from "../../../registry/ui/textarea";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    agentTasks: "مهام الوكيل",
    copilot: "المساعد",
    description:
      "صف مهمتك بلغة طبيعية. سيعمل المساعد في الخلفية ويفتح طلب سحب لمراجعتك.",
    dir: "rtl" as const,
    openPopover: "فتح القائمة",
    placeholder: "صف مهمتك بلغة طبيعية.",
    startTask: "ابدأ مهمة جديدة مع المساعد",
  },
  he: {
    agentTasks: "משימות סוכן",
    copilot: "עוזר",
    description:
      "תאר את המשימה שלך בשפה טבעית. העוזר יעבוד ברקע ויפתח בקשת משיכה לבדיקתך.",
    dir: "rtl" as const,
    openPopover: "פתח תפריט",
    placeholder: "תאר את המשימה שלך בשפה טבעית.",
    startTask: "התחל משימה חדשה עם העוזר",
  },
};

export function ButtonGroupPopover() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  return (
    <ButtonGroup dir={t().dir}>
      <Button variant="outline" size="sm">
        <BotIcon /> {t().copilot}
      </Button>
      <PopoverTrigger>
        <Button variant="outline" size="icon-sm" aria-label={t().openPopover}>
          <ChevronDownIcon />
        </Button>
        <Popover dir={t().dir} data-lang={lang()} class="p-0">
          <div class="px-4 py-3">
            <div class="text-sm font-medium">{t().agentTasks}</div>
          </div>
          <Separator />
          <div class="p-4 text-sm *:[p:not(:last-child)]:mb-2">
            <Textarea placeholder={t().placeholder} class="mb-4 resize-none" />
            <p class="font-medium">{t().startTask}</p>
            <p class="text-muted-foreground">{t().description}</p>
          </div>
        </Popover>
      </PopoverTrigger>
    </ButtonGroup>
  );
}
