/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/notion-prompt-form.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, createMemo, For } from "solid-js";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../registry/ui/avatar";
import { Badge } from "../../../registry/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../registry/ui/command";
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../../registry/ui/dropdown-menu";
import { Field, FieldLabel } from "../../../registry/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "../../../registry/ui/input-group";
import { PopoverTrigger, Popover } from "../../../registry/ui/popover";
import { TooltipTrigger, Tooltip } from "../../../registry/ui/tooltip";
import {
  IconArrowUp,
  IconAt,
  IconBook,
  IconCircleDashedPlus,
  IconPaperclip,
  IconPlus,
  IconWorld,
  IconX,
} from "./icons";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    addContext: "أضف سياق",
    agentMode: "وضع الوكيل",
    allSources: "جميع المصادر",
    allSourcesAccess: "جميع المصادر التي يمكنني الوصول إليها",
    analyticsReport: "تقرير التحليلات",
    appsIntegrations: "التطبيقات والتكاملات",
    attachFile: "إرفاق ملف",
    auto: "تلقائي",
    beta: "تجريبي",
    budgetPlanning: "تخطيط الميزانية",
    calendarEvents: "التقويم والأحداث",
    connectApps: "ربط التطبيقات",
    dir: "rtl" as const,
    documentation: "التوثيق",
    findKnowledge: "ابحث أو استخدم المعرفة في...",
    goalsObjectives: "الأهداف والغايات",
    helpCenter: "مركز المساعدة",
    ideasBrainstorming: "أفكار وعصف ذهني",
    meetingNotes: "ملاحظات الاجتماع",
    mentionTooltip: "اذكر شخصًا أو صفحة أو تاريخًا",
    noKnowledgeFound: "لم يتم العثور على معرفة",
    noPagesFound: "لم يتم العثور على صفحات",
    pages: "الصفحات",
    placeholder: "اسأل، ابحث، أو أنشئ أي شيء...",
    planMode: "وضع التخطيط",
    projectDashboard: "لوحة المشروع",
    prompt: "الأمر",
    searchPages: "البحث في الصفحات...",
    searchSourcesNote: "سنبحث فقط في المصادر المحددة هنا.",
    selectAgentMode: "اختر وضع الوكيل",
    selectModel: "اختر نموذج الذكاء الاصطناعي",
    send: "إرسال",
    teamDirectory: "دليل الفريق",
    technicalSpecs: "المواصفات التقنية",
    users: "المستخدمون",
    webSearch: "البحث على الويب",
    workspace: "مساحة العمل",
  },
  he: {
    addContext: "הוסף הקשר",
    agentMode: "מצב סוכן",
    allSources: "כל המקורות",
    allSourcesAccess: "כל המקורות שיש לי גישה אליהם",
    analyticsReport: "דוח אנליטיקה",
    appsIntegrations: "אפליקציות ואינטגרציות",
    attachFile: "צרף קובץ",
    auto: "אוטומטי",
    beta: "בטא",
    budgetPlanning: "תכנון תקציב",
    calendarEvents: "יומן ואירועים",
    connectApps: "חבר אפליקציות",
    dir: "rtl" as const,
    documentation: "תיעוד",
    findKnowledge: "מצא או השתמש בידע ב...",
    goalsObjectives: "מטרות ויעדים",
    helpCenter: "מרכז עזרה",
    ideasBrainstorming: "רעיונות וסיעור מוחות",
    meetingNotes: "הערות פגישה",
    mentionTooltip: "הזכר אדם, עמוד או תאריך",
    noKnowledgeFound: "לא נמצא ידע",
    noPagesFound: "לא נמצאו עמודים",
    pages: "עמודים",
    placeholder: "שאל, חפש, או צור משהו...",
    planMode: "מצב תכנון",
    projectDashboard: "לוח מחוונים לפרויקט",
    prompt: "פקודה",
    searchPages: "חפש עמודים...",
    searchSourcesNote: "נחפש רק במקורות שנבחרו כאן.",
    selectAgentMode: "בחר מצב סוכן",
    selectModel: "בחר מודל AI",
    send: "שלח",
    teamDirectory: "ספריית צוות",
    technicalSpecs: "מפרט טכני",
    users: "משתמשים",
    webSearch: "חיפוש באינטרנט",
    workspace: "סביבת עבודה",
  },
};

function MentionableIcon(props: {
  item: { type: string; title: string; image: string };
}) {
  return (
    <>
      {props.item.type === "page" ? (
        <span class="flex size-4 items-center justify-center">
          {props.item.image}
        </span>
      ) : (
        <Avatar class="size-4">
          <AvatarImage src={props.item.image} />
          <AvatarFallback>{props.item.title[0]}</AvatarFallback>
        </Avatar>
      )}
    </>
  );
}

export function NotionPromptForm() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];

  const SAMPLE_DATA = createMemo(() => ({
    mentionable: [
      { image: "📝", title: t().meetingNotes, type: "page" },
      { image: "📊", title: t().projectDashboard, type: "page" },
      { image: "💡", title: t().ideasBrainstorming, type: "page" },
      { image: "📅", title: t().calendarEvents, type: "page" },
      { image: "📚", title: t().documentation, type: "page" },
      { image: "🎯", title: t().goalsObjectives, type: "page" },
      { image: "💰", title: t().budgetPlanning, type: "page" },
      { image: "👥", title: t().teamDirectory, type: "page" },
      { image: "🔧", title: t().technicalSpecs, type: "page" },
      { image: "📈", title: t().analyticsReport, type: "page" },
      {
        image: "https://github.com/shadcn.png",
        title: "shadcn",
        type: "user",
        workspace: t().workspace,
      },
      {
        image: "https://github.com/maxleiter.png",
        title: "maxleiter",
        type: "user",
        workspace: t().workspace,
      },
      {
        image: "https://github.com/evilrabbit.png",
        title: "evilrabbit",
        type: "user",
        workspace: t().workspace,
      },
    ],
    models: [
      { key: "auto" as const, name: t().auto },
      { badge: t().beta, key: "agent" as const, name: t().agentMode },
      { key: "plan" as const, name: t().planMode },
    ],
  }));

  const [mentions, setMentions] = createSignal<string[]>([]);
  const [mentionPopoverOpen, setMentionPopoverOpen] = createSignal(false);
  const [modelPopoverOpen, setModelPopoverOpen] = createSignal(false);

  const [modelKey, setModelKey] = createSignal<"auto" | "agent" | "plan">(
    "auto"
  );

  const selectedModel = () =>
    SAMPLE_DATA().models.find((model) => model.key === modelKey()) ?? {
      name: t().auto,
    };

  const [scopeMenuOpen, setScopeMenuOpen] = createSignal(false);

  const grouped = createMemo(() => {
    type Mention = ReturnType<typeof SAMPLE_DATA>["mentionable"][number];

    const groupedMentions: Record<string, Mention[]> = {};

    for (const mention of SAMPLE_DATA().mentionable) {
      if (!mentions().includes(mention.title)) {
        (groupedMentions[mention.type] ??= []).push(mention);
      }
    }

    return groupedMentions;
  });

  const hasMentions = () => mentions().length > 0;

  return (
    <div dir={t().dir}>
      <form>
        <Field>
          <FieldLabel for="rtl-notion-prompt" class="sr-only">
            {t().prompt}
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="rtl-notion-prompt"
              placeholder={t().placeholder}
            />
            <InputGroupAddon align="block-start">
              <PopoverTrigger
                isOpen={mentionPopoverOpen()}
                onOpenChange={(value) => {
                  setMentionPopoverOpen(value);
                }}
              >
                <TooltipTrigger>
                  <InputGroupButton
                    variant="outline"
                    size={hasMentions() ? "icon-sm" : "sm"}
                    class="rounded-full transition-transform"
                    onFocus={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <IconAt />
                    {!hasMentions() && t().addContext}
                  </InputGroupButton>
                  <Tooltip>{t().mentionTooltip}</Tooltip>
                </TooltipTrigger>
                <Popover class="p-0" dir={t().dir}>
                  <Command>
                    <CommandInput placeholder={t().searchPages} />
                    <CommandList>
                      <CommandEmpty>{t().noPagesFound}</CommandEmpty>
                      <For each={Object.entries(grouped())}>
                        {([type, items]) => (
                          <CommandGroup
                            heading={type === "page" ? t().pages : t().users}
                          >
                            <For each={items}>
                              {(item) => (
                                <CommandItem
                                  id={item.title}
                                  onAction={() => {
                                    const currentValue = item.title;
                                    setMentions((prev) => [
                                      ...prev,
                                      currentValue,
                                    ]);
                                    setMentionPopoverOpen(false);
                                  }}
                                >
                                  <MentionableIcon item={item} />
                                  {item.title}
                                </CommandItem>
                              )}
                            </For>
                          </CommandGroup>
                        )}
                      </For>
                    </CommandList>
                  </Command>
                </Popover>
              </PopoverTrigger>
              <div class="no-scrollbar -m-1.5 flex gap-1 overflow-y-auto p-1.5">
                <For each={mentions()}>
                  {(mention) => {
                    const item = SAMPLE_DATA().mentionable.find(
                      (itemValue) => itemValue.title === mention
                    );

                    if (!item) {
                      return null;
                    }

                    return (
                      <InputGroupButton
                        size="sm"
                        variant="secondary"
                        class="rounded-full pr-2!"
                        onPress={() => {
                          setMentions((prev) =>
                            prev.filter((m) => m !== mention)
                          );
                        }}
                      >
                        <MentionableIcon item={item} />
                        {item.title}
                        <IconX />
                      </InputGroupButton>
                    );
                  }}
                </For>
              </div>
            </InputGroupAddon>
            <InputGroupAddon class="gap-1" align="block-end">
              <TooltipTrigger>
                <InputGroupButton
                  size="icon-sm"
                  class="rounded-full"
                  aria-label={t().attachFile}
                >
                  <IconPaperclip />
                </InputGroupButton>
                <Tooltip>{t().attachFile}</Tooltip>
              </TooltipTrigger>
              <DropdownMenuTrigger
                isOpen={modelPopoverOpen()}
                onOpenChange={(value) => {
                  setModelPopoverOpen(value);
                }}
              >
                <TooltipTrigger>
                  <InputGroupButton size="sm" class="rounded-full">
                    {selectedModel().name}
                  </InputGroupButton>
                  <Tooltip>{t().selectModel}</Tooltip>
                </TooltipTrigger>
                <DropdownMenu
                  placement="top"
                  class="w-48"
                  selectionMode="single"
                  selectedKeys={[modelKey()]}
                  dir={t().dir}
                >
                  <DropdownMenuGroup class="w-48">
                    <DropdownMenuLabel class="text-muted-foreground text-xs">
                      {t().selectAgentMode}
                    </DropdownMenuLabel>
                    <For each={SAMPLE_DATA().models}>
                      {(model) => (
                        <DropdownMenuItem
                          id={model.key}
                          onAction={() => {
                            setModelKey(model.key);
                          }}
                          class="pr-2 *:[span:first-child]:right-auto *:[span:first-child]:left-2"
                        >
                          {model.name}
                          {Boolean(model.badge) && (
                            <Badge
                              variant="secondary"
                              class="h-5 rounded-sm bg-blue-100 px-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                            >
                              {model.badge}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      )}
                    </For>
                  </DropdownMenuGroup>
                </DropdownMenu>
              </DropdownMenuTrigger>
              <DropdownMenuTrigger
                isOpen={scopeMenuOpen()}
                onOpenChange={(value) => {
                  setScopeMenuOpen(value);
                }}
              >
                <InputGroupButton size="sm" class="rounded-full">
                  <IconWorld />
                  {t().allSources}
                </InputGroupButton>
                <DropdownMenu placement="top" class="w-72" dir={t().dir}>
                  <DropdownMenuGroup>
                    <DropdownMenuItem shouldCloseOnSelect={false} />
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem shouldCloseOnSelect={false} />
                    <DropdownMenuItem>
                      <IconCircleDashedPlus /> {t().allSourcesAccess}
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Avatar class="size-4">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        shadcn
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent
                        class="w-72 rounded-lg p-0"
                        dir={t().dir}
                        placement="left"
                      >
                        <Command>
                          <CommandInput
                            placeholder={t().findKnowledge}
                            autoFocus
                          />
                          <CommandList>
                            <CommandEmpty>{t().noKnowledgeFound}</CommandEmpty>
                            <CommandGroup>
                              <For
                                each={SAMPLE_DATA().mentionable.filter(
                                  (item) => item.type === "user"
                                )}
                              >
                                {(user) => (
                                  <CommandItem
                                    id={user.title}
                                    onAction={() => {
                                      console.log("Selected user:", user.title);
                                    }}
                                  >
                                    <Avatar class="size-4">
                                      <AvatarImage src={user.image} />
                                      <AvatarFallback>
                                        {user.title[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.title}{" "}
                                    <span class="text-muted-foreground">
                                      -{" "}
                                      {"workspace" in user
                                        ? user.workspace
                                        : undefined}
                                    </span>
                                  </CommandItem>
                                )}
                              </For>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                      <IconBook /> {t().helpCenter}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <IconPlus /> {t().connectApps}
                    </DropdownMenuItem>
                    <DropdownMenuLabel class="text-muted-foreground text-xs">
                      {t().searchSourcesNote}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                </DropdownMenu>
              </DropdownMenuTrigger>
              <InputGroupButton
                aria-label={t().send}
                class="ms-auto rounded-full"
                variant="default"
                size="icon-sm"
              >
                <IconArrowUp />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </form>
    </div>
  );
}
