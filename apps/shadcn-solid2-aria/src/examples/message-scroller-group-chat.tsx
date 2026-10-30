/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/message-scroller-group-chat.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { RotateCwIcon } from "@lucide/solid";
import { createMemo, createSignal, For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import { Button } from "../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../registry/ui/card";
import { Marker, MarkerContent } from "../registry/ui/marker";
import { Message, MessageContent, MessageHeader } from "../registry/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../registry/ui/message-scroller";
import { Tooltip, TooltipTrigger } from "../registry/ui/tooltip";

const currentUser = "Grace";

const initialItems = [
  {
    id: "group-1",
    role: "participant",
    sender: "Grace",
    text: "@mary, the astrophage line keeps matching Venus energy output. Can you check my math?",
    type: "message",
  },
  {
    id: "group-2",
    role: "assistant",
    sender: "Mary (Agent)",
    text: "Yes. Confirmed. The curve points to a microorganism harvesting stellar energy and breeding near carbon dioxide. If @rocky agrees, this is the clue we need.",
    type: "message",
  },
  {
    id: "group-3",
    role: "participant",
    scrollAnchor: true,
    sender: "Grace",
    text: "ping @rocky",
    type: "message",
  },
] satisfies GroupChatItem[];

const rockyMarker = {
  id: "group-4",
  scrollAnchor: true,
  text: "Rocky has joined the chat",
  type: "event",
} satisfies GroupChatItem;

const rockyMessage = {
  id: "group-5",
  role: "participant",
  sender: "Rocky",
  text: "Amaze. Astrophage eats light, makes heat, goes to carbon dioxide. Rocky has fuel model. Grace is smart.",
  type: "message",
} satisfies GroupChatItem;

type GroupChatItem =
  | {
      id: string;
      type: "event";
      text: string;
      scrollAnchor?: boolean;
    }
  | {
      id: string;
      type: "message";
      sender: string;
      role: "assistant" | "participant";
      text: string;
      scrollAnchor?: boolean;
    };

export function MessageScrollerGroupChat() {
  const [rockyTurn, setRockyTurn] = createSignal<"idle" | "marker" | "message">(
    "idle"
  );

  const items = createMemo(() => {
    if (rockyTurn() === "message") {
      return [...initialItems, rockyMarker, rockyMessage];
    }

    if (rockyTurn() === "marker") {
      return [...initialItems, rockyMarker];
    }

    return initialItems;
  });

  const buttonLabel = () =>
    rockyTurn() === "idle" ? "Add Rocky" : "Send Message as Rocky";

  const isComplete = () => rockyTurn() === "message";

  return (
    <MessageScrollerProvider>
      <div class="relative flex flex-col gap-4">
        <Card class="mx-auto h-140 w-full max-w-sm gap-0">
          <CardHeader class="gap-1 border-b">
            <CardTitle>Group Chat</CardTitle>
            <CardDescription>
              A group chat with several participants and an assistant. The
              Marker is marked as a turn.
            </CardDescription>
            <CardAction>
              <TooltipTrigger>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Reset conversation"
                  isDisabled={rockyTurn() === "idle"}
                  onPress={() => {
                    setRockyTurn("idle");
                  }}
                >
                  <RotateCwIcon />
                </Button>
                <Tooltip>
                  <p>Reset</p>
                </Tooltip>
              </TooltipTrigger>
            </CardAction>
          </CardHeader>
          <CardContent class="min-h-0 flex-1 p-0">
            <MessageScrollerProvider>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent class="p-(--card-spacing)">
                    {
                      <For each={items()}>
                        {(item) =>
                          item.type === "message" ? (
                            <GroupChatMessage item={item} />
                          ) : (
                            <GroupChatMarker
                              item={item}
                              scrollAnchor={item.scrollAnchor}
                            />
                          )
                        }
                      </For>
                    }
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          </CardContent>
          <CardFooter class="flex flex-col items-center gap-2 border-t">
            <Button
              type="button"
              isDisabled={isComplete()}
              onPress={() => {
                setRockyTurn((turn) =>
                  turn === "idle" ? "marker" : "message"
                );
              }}
              class="w-full"
              variant="secondary"
            >
              {buttonLabel()}
            </Button>
            <p class="text-muted-foreground text-xs">
              {rockyTurn() === "idle"
                ? "This will create a marker and make it the anchor"
                : "Now send Rocky's reply into the conversation"}
            </p>
          </CardFooter>
        </Card>
        <div class="text-muted-foreground mx-auto max-w-sm px-0.5 text-center text-xs text-balance">
          When a user joins, a marker is created. scrollAnchor on the marker
          marks it as the next turn
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

function GroupChatMessage(componentProps: {
  item: Extract<GroupChatItem, { type: "message" }>;
}) {
  const isCurrentUser = createMemo(
    () => componentProps.item.sender === currentUser
  );

  const variant = createMemo(() => {
    if (isCurrentUser()) {
      return "muted";
    }

    return componentProps.item.role === "assistant" ? "ghost" : "tinted";
  });

  return (
    <MessageScrollerItem
      id={componentProps.item.id}
      scrollAnchor={componentProps.item.scrollAnchor}
    >
      <Message align={isCurrentUser() ? "end" : "start"}>
        <MessageContent>
          {!isCurrentUser() && (
            <MessageHeader>{componentProps.item.sender}</MessageHeader>
          )}
          <Bubble variant={variant()}>
            <BubbleContent>{componentProps.item.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  );
}

function GroupChatMarker(componentProps: {
  item: Extract<GroupChatItem, { type: "event" }>;
  scrollAnchor?: boolean;
}) {
  return (
    <MessageScrollerItem scrollAnchor={componentProps.scrollAnchor ?? false}>
      <Marker variant="separator">
        <MarkerContent>{componentProps.item.text}</MarkerContent>
      </Marker>
    </MessageScrollerItem>
  );
}

export default MessageScrollerGroupChat;
