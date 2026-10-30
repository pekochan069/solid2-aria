/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/button-group-input-group.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { AudioLinesIcon, PlusIcon } from "@lucide/solid";
import { createSignal } from "solid-js";

import { Button } from "../../../registry/ui/button";
import { ButtonGroup } from "../../../registry/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../registry/ui/input-group";
import { TooltipTrigger, Tooltip } from "../../../registry/ui/tooltip";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    add: "إضافة",
    dir: "rtl" as const,
    messagePlaceholder: "أرسل رسالة...",
    voiceMode: "الوضع الصوتي",
    voicePlaceholder: "سجل وأرسل صوتًا...",
  },
  he: {
    add: "הוסף",
    dir: "rtl" as const,
    messagePlaceholder: "שלח הודעה...",
    voiceMode: "מצב קולי",
    voicePlaceholder: "הקלט ושלח אודיו...",
  },
};

export function ButtonGroupInputGroup() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];
  const [voiceEnabled, setVoiceEnabled] = createSignal(false);

  return (
    <ButtonGroup dir={t().dir}>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label={t().add}>
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup class="flex-1">
        <InputGroup>
          <InputGroupInput
            placeholder={
              voiceEnabled() ? t().voicePlaceholder : t().messagePlaceholder
            }
            disabled={voiceEnabled()}
          />
          <InputGroupAddon align="inline-end">
            <TooltipTrigger>
              <InputGroupButton
                onPress={() => {
                  setVoiceEnabled(!voiceEnabled());
                }}
                data-active={voiceEnabled()}
                class="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                aria-pressed={voiceEnabled()}
                size="icon-xs"
                aria-label={t().voiceMode}
              >
                <AudioLinesIcon />
              </InputGroupButton>
              <Tooltip>{t().voiceMode}</Tooltip>
            </TooltipTrigger>
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  );
}
