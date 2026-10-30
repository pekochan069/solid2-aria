/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/message-scroller-commands.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import { Button } from "../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../registry/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";
import { Message, MessageContent } from "../registry/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../registry/ui/message-scroller";
import { createChat, getMessageText } from "./_chat";
import { useMessageScroller } from "./_scroller";

const chat = createChat()
  .user(
    "We're seeing activation dip after workspace creation. Can you help me find the likely step?",
    { id: "command-activation" }
  )
  .assistant(
    "The sharpest drop is between creating the workspace and inviting the first teammate.\n\nWorkspace creation is still healthy, but the invite step is where users pause. That suggests the product is asking for collaboration before the user has enough confidence in the workspace."
  )
  .user("What should I compare before we change the onboarding flow?", {
    id: "command-compare",
  })
  .assistant(
    "Compare three cohorts:\n\n1. Users who choose a template before inviting teammates.\n2. Users who start from a blank workspace.\n3. Users who skip invites and return within 24 hours.\n\nIf template users invite faster, the fix is probably better first-run guidance rather than a louder invite prompt."
  )
  .user("Can you turn that into an experiment?", {
    id: "command-experiment",
  })
  .assistant(
    "Yes. Create a variant that shows a short checklist after workspace creation:\n\n- Pick a template.\n- Add one project detail.\n- Invite a teammate when the workspace has context.\n\nMeasure first invite completion, 24-hour return rate, and whether teams create a second project."
  )
  .user("What's the risk if we delay the invite prompt?", {
    id: "command-risk",
  })
  .assistant(
    "The main risk is reducing team creation for accounts that already know who they want to invite.\n\nTo protect that path, keep the invite action visible in the header and only change the primary empty-state guidance. That gives confident teams a direct route without forcing uncertain users through the invite step too early."
  );

const messages = chat.get();
const userMessages = messages.filter((message) => message.role === "user");

export function MessageScrollerCommands() {
  return (
    <MessageScrollerProvider>
      <div class="relative flex flex-col gap-4">
        <Card class="mx-auto h-140 w-full max-w-sm gap-0">
          <CardHeader class="gap-1 border-b">
            <CardTitle>Commands</CardTitle>
            <CardDescription>
              Drive the transcript from outside.
            </CardDescription>
            <CardAction>
              <CommandMenu />
            </CardAction>
          </CardHeader>
          <CardContent class="flex-1 overflow-hidden p-0">
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent class="p-(--card-spacing)">
                  {
                    <For each={messages}>
                      {(message) => {
                        const isUserMessage = message.role === "user";
                        const text = getMessageText(message);

                        return (
                          <MessageScrollerItem
                            id={message.id}
                            scrollAnchor={isUserMessage}
                          >
                            <Message align={isUserMessage ? "end" : "start"}>
                              <MessageContent>
                                <Bubble
                                  variant={isUserMessage ? "muted" : "ghost"}
                                >
                                  <BubbleContent class="space-y-2">
                                    {
                                      <For
                                        each={text
                                          .split(/\n\s*\n/u)
                                          .map((paragraph) => paragraph.trim())
                                          .filter(Boolean)}
                                      >
                                        {(paragraph, _index) => (
                                          <p class="whitespace-pre-wrap">
                                            {paragraph}
                                          </p>
                                        )}
                                      </For>
                                    }
                                  </BubbleContent>
                                </Bubble>
                              </MessageContent>
                            </Message>
                          </MessageScrollerItem>
                        );
                      }}
                    </For>
                  }
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </CardContent>
        </Card>
        <div class="text-muted-foreground mx-auto max-w-sm px-0.5 text-center text-xs text-balance">
          Use the controls to jump to any message in the conversation.
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

function CommandMenu() {
  const { scrollToMessage } = useMessageScroller();

  return (
    <DropdownMenuTrigger>
      <Button type="button" variant="secondary">
        Jump to...
      </Button>
      <DropdownMenu placement="bottom end" class="w-64">
        <DropdownMenuLabel>Conversations</DropdownMenuLabel>
        {
          <For each={userMessages}>
            {(message) => (
              <DropdownMenuItem
                onAction={() => {
                  scrollToMessage(message.id, {
                    align: "start",
                    behavior: "smooth",
                  });
                }}
              >
                <span class="line-clamp-1 min-w-0">
                  {getTrimmedMessageText(message)}
                </span>
              </DropdownMenuItem>
            )}
          </For>
        }
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

function getTrimmedMessageText(message: (typeof userMessages)[number]) {
  const text = getMessageText(message);

  return text.length > 42 ? `${text.slice(0, 39)}...` : text;
}

export default MessageScrollerCommands;
