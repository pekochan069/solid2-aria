/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/message-scroller-visibility.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "@solid2-aria/components";
import { For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../registry/ui/card";
import { HoverCard, HoverCardTrigger } from "../registry/ui/hover-card";
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
import { useMessageScroller, useMessageScrollerVisibility } from "./_scroller";

const chat = createChat()
  .user("Review the incident handoff and tell me what to read first.", {
    id: "vis-brief",
  })
  .assistant(
    "Start with the summary and the impact section. The regression affected the upload queue, but the recovery path completed for every queued job."
  )
  .user("What was the customer impact?", {
    id: "vis-impact",
  })
  .assistant(
    "Impact was limited to delayed processing.\n\nNo records were dropped, and the reconciliation worker confirmed each retry batch. Support saw confusion from two customers, but there were no checkout or billing errors."
  )
  .user("What actions are open?", {
    id: "vis-actions",
  })
  .assistant(
    "Keep the retry window enabled until the next deploy, then add a queue-depth alert as the long-term fix.\n\nThe alert should fire on sustained queue growth, not a single short spike."
  )
  .user("Give me the follow-up checklist.", {
    id: "vis-checklist",
  })
  .assistant(
    "After that, compare the queue recovery graph with the deploy timeline so the handoff shows exactly when processing returned to baseline. That makes it easier for support and engineering to answer the same customer questions without re-reading the whole incident thread.\n\nI would also add a short owner note beside each follow-up item. The checklist is small, but ownership keeps the retry-window decision, alert tuning, and support macro from drifting into separate follow-up conversations.\n\nKeep the retry window enabled until the next deploy, then add a queue-depth alert as the long-term fix.\n\nThe alert should fire on sustained queue growth, not a single short spike."
  );

const messages = chat.get();
const userMessages = messages.filter((message) => message.role === "user");

export function MessageScrollerVisibility() {
  return (
    <MessageScrollerProvider>
      <div class="relative flex flex-col gap-4">
        <div class="relative mx-auto w-full max-w-sm">
          <Card class="h-140 w-full gap-0">
            <CardHeader class="gap-1 border-b">
              <CardTitle>Transcript Outline</CardTitle>
              <CardDescription>
                Track the current anchored turn.
              </CardDescription>
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
                                            .map((paragraph) =>
                                              paragraph.trim()
                                            )
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
          <div class="absolute top-1/2 -right-12 -translate-y-1/2">
            <TranscriptOutline />
          </div>
        </div>
        <div class="text-muted-foreground mx-auto max-w-sm px-0.5 text-center text-xs">
          Open the outline to jump between anchored turns as you read.
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

function TranscriptOutline() {
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId } = useMessageScrollerVisibility();

  return (
    <HoverCardTrigger>
      <Button
        aria-label="Open transcript outline"
        class="focus-visible:ring-ring/50 flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md transition-colors outline-none focus-visible:ring-3"
      >
        {
          <For each={userMessages}>
            {(message) => (
              <span
                data-current={message.id === currentAnchorId()}
                class="bg-muted-foreground/40 data-[current=true]:bg-foreground h-0.5 w-4 rounded-full"
              />
            )}
          </For>
        }
      </Button>
      <HoverCard
        placement="left"
        offset={-28}
        class="flex w-64 flex-col gap-1 rounded-2xl p-1"
      >
        {
          <For each={userMessages}>
            {(message) => (
              <button
                type="button"
                aria-current={
                  currentAnchorId() === message.id ? "location" : undefined
                }
                class="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground aria-current:bg-accent aria-current:text-accent-foreground flex min-h-7 items-center rounded-xl px-2 py-1.5 text-left text-sm transition-colors outline-none"
                onClick={() => {
                  scrollToMessage(message.id, {
                    align: "start",
                    behavior: "smooth",
                  });
                }}
              >
                <span class="line-clamp-1 min-w-0">
                  {getTrimmedMessageText(message)}
                </span>
              </button>
            )}
          </For>
        }
      </HoverCard>
    </HoverCardTrigger>
  );
}

function getTrimmedMessageText(message: (typeof userMessages)[number]) {
  const text = getMessageText(message);

  return text.length > 42 ? `${text.slice(0, 39)}...` : text;
}

export default MessageScrollerVisibility;
