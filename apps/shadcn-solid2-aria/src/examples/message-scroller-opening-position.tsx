/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/message-scroller-opening-position.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createEffect, createSignal, For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../registry/ui/card";
import { Message, MessageContent } from "../registry/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../registry/ui/message-scroller";
import { Tabs, TabsList, TabsTrigger } from "../registry/ui/tabs";
import { useMessageScroller } from "./_scroller";

const messages = [
  {
    id: "open-1",
    role: "user",
    text: "This is the first message the user sent in the conversation.",
  },
  {
    id: "open-2",
    role: "assistant",
    text: "Workspace creation rose 8%, but first invite completion only rose 2%.",
  },
  {
    id: "open-3",
    role: "user",
    text: "This is the last message the user sent in the conversation.",
  },
  {
    id: "open-4",
    role: "assistant",
    text: "Start with the invite step. Teams are creating workspaces but waiting to add collaborators.\n\nRecommended follow-up:\n\n1. Compare invite drop-off by account size.\n2. Check whether users who skip invites still return within 24 hours.\n3. Review the empty-state copy on the first project screen.\n4. Segment activation by template, since template users may not need invites right away.\n\nIf that pattern holds, the next experiment should make collaboration useful earlier instead of prompting for invites harder.",
  },
] satisfies {
  id: string;
  role: "user" | "assistant";
  text: string;
}[];

const positions = [
  { label: "start", value: "start" },
  { label: "end", value: "end" },
  { label: "last-anchor", value: "last-anchor" },
] satisfies {
  value: "start" | "end" | "last-anchor";
  label: string;
}[];

export function MessageScrollerOpeningPosition() {
  const [positionKey, setPositionKey] = createSignal(0);

  const [position, setPosition] = createSignal<"start" | "end" | "last-anchor">(
    "last-anchor"
  );

  return (
    <div class="relative flex flex-col gap-4">
      <Card class="mx-auto h-140 w-full max-w-sm gap-0">
        <CardHeader class="gap-1 border-b">
          <CardTitle>Opening Position</CardTitle>
          <CardDescription>
            Choose where a saved transcript opens.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex-1 overflow-hidden p-0">
          <MessageScrollerProvider>
            <OpeningPositionScroller
              position={position()}
              positionKey={positionKey()}
            />
          </MessageScrollerProvider>
        </CardContent>
        <CardFooter class="flex items-center justify-center border-t">
          <Tabs
            selectedKey={position()}
            onSelectionChange={(value) => {
              if (
                value === "start" ||
                value === "end" ||
                value === "last-anchor"
              ) {
                setPosition(value);
                setPositionKey((key) => key + 1);
              }
            }}
            class="w-full"
          >
            <TabsList class="w-full">
              {
                <For each={positions}>
                  {(option) => (
                    <TabsTrigger id={option.value}>{option.label}</TabsTrigger>
                  )}
                </For>
              }
            </TabsList>
          </Tabs>
        </CardFooter>
      </Card>
      <div class="text-muted-foreground mx-auto max-w-sm px-0.5 text-center text-xs">
        Toggle the defaultScrollPosition to see where the transcript starts when
        you open the thread
      </div>
    </div>
  );
}

function OpeningPositionScroller(componentProps: {
  position: "start" | "end" | "last-anchor";
  positionKey: number;
}) {
  const { scrollToEnd, scrollToMessage, scrollToStart } = useMessageScroller();

  createEffect(
    () => [
      componentProps.position,
      componentProps.positionKey,
      scrollToEnd,
      scrollToMessage,
      scrollToStart,
    ],
    () => {
      const frame = requestAnimationFrame(() => {
        if (componentProps.position === "start") {
          scrollToStart({ behavior: "auto" });

          return;
        }

        if (componentProps.position === "end") {
          scrollToEnd({ behavior: "auto" });

          return;
        }

        scrollToMessage("open-3", {
          align: "start",
          behavior: "auto",
          scrollMargin: 64,
        });
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }
  );

  return (
    <MessageScroller>
      <MessageScrollerViewport>
        <MessageScrollerContent class="p-(--card-spacing)">
          {
            <For each={messages}>
              {(message) => {
                const isUserMessage = message.role === "user";

                return (
                  <MessageScrollerItem
                    id={message.id}
                    scrollAnchor={isUserMessage}
                  >
                    <Message align={isUserMessage ? "end" : "start"}>
                      <MessageContent>
                        <Bubble variant={isUserMessage ? "muted" : "ghost"}>
                          <BubbleContent class="space-y-2">
                            {
                              <For
                                each={message.text
                                  .split(/\n\s*\n/u)
                                  .map((paragraph) => paragraph.trim())
                                  .filter(Boolean)}
                              >
                                {(paragraph, _index) => (
                                  <p class="whitespace-pre-wrap">{paragraph}</p>
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
  );
}

export default MessageScrollerOpeningPosition;
