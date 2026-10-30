/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/message-scroller-load-history.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

// Mount <Toaster /> once at the application root.
import { RotateCwIcon } from "@lucide/solid";
import { createSignal, For } from "solid-js";

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
import { Message, MessageContent } from "../registry/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../registry/ui/message-scroller";
import { toast } from "../registry/ui/sonner";
import { Tooltip, TooltipTrigger } from "../registry/ui/tooltip";
import { createChat, getMessageText } from "./_chat";

const chat = createChat()
  .user("Can you summarize the incident channel?")
  .assistant(
    "The first alert was a delayed export job. It started backing up around 09:42 UTC and triggered the warning once the retry queue crossed the threshold.\n\nNo customer-facing checkout paths were affected, but exports for larger workspaces were running about 12 minutes behind."
  )
  .user("Was checkout affected?")
  .assistant(
    "No checkout errors were reported. Payment authorization, order creation, and confirmation emails stayed inside their normal latency bands.\n\nThe only elevated metric was export queue depth, which maps to analytics downloads instead of checkout."
  )
  .user("What changed in the last deploy?")
  .assistant(
    "Only the export queue worker changed. The deploy moved large CSV jobs onto the shared retry policy, which made each failed attempt hold a worker slot longer than before.\n\nThe app deploy did not include checkout, pricing, or billing API changes."
  )
  .user("Do we need to roll back?")
  .assistant(
    "Not yet. Queue depth is recovering after we reduced retry concurrency, and the oldest pending job is now under five minutes old.\n\nKeep rollback ready if the queue starts climbing again, but the current trend points toward recovery."
  )
  .user("Keep watching for customer-visible issues.")
  .assistant(
    "I will watch the queue and support tags for another 15 minutes. I am tracking export failures, delayed download requests, and any support thread that mentions missing reports.\n\nIf those stay quiet through the next batch window, we can close this as an internal degradation."
  );

const history = chat.get();
const INITIAL_VISIBLE_COUNT = 5;

export function MessageScrollerLoadHistory() {
  const [visibleCount, setVisibleCount] = createSignal(INITIAL_VISIBLE_COUNT);
  const visibleMessages = () => history.slice(-visibleCount());
  const canLoadHistory = () => visibleCount() < history.length;

  return (
    <MessageScrollerProvider>
      <div class="relative flex flex-col gap-4">
        <Card class="mx-auto h-140 w-full max-w-sm gap-0">
          <CardHeader class="gap-1 border-b">
            <CardTitle>Load History</CardTitle>
            <CardDescription>
              Prepended messages keep your place.
            </CardDescription>
            <CardAction>
              <TooltipTrigger>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Reset loaded messages"
                  isDisabled={visibleCount() === INITIAL_VISIBLE_COUNT}
                  onPress={() => {
                    setVisibleCount(INITIAL_VISIBLE_COUNT);
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
          <CardContent class="flex-1 overflow-hidden p-0">
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent class="p-(--card-spacing)">
                  {
                    <For each={visibleMessages()}>
                      {(message) => {
                        const isUserMessage = message.role === "user";

                        return (
                          <MessageScrollerItem id={message.id}>
                            <Message align={isUserMessage ? "end" : "start"}>
                              <MessageContent>
                                <Bubble
                                  variant={isUserMessage ? "muted" : "ghost"}
                                >
                                  <BubbleContent class="space-y-2">
                                    {
                                      <For
                                        each={getMessageText(message)
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
                  <MessageScrollerItem scrollAnchor={false}>
                    <Marker variant="separator">
                      <MarkerContent>End of Conversation</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </CardContent>
          <CardFooter class="flex flex-col items-center gap-2 border-t">
            <Button
              type="button"
              isDisabled={!canLoadHistory()}
              onPress={() => {
                setVisibleCount(history.length);
                toast("History loaded", {
                  description: "Scroll up to see earlier messages.",
                });
              }}
              class="w-full"
              variant="secondary"
            >
              {canLoadHistory() ? "Load History" : "History Loaded"}
            </Button>
            <p class="text-muted-foreground text-xs">
              Restore earlier messages while keeping your place.
            </p>
          </CardFooter>
        </Card>
        <div class="text-muted-foreground mx-auto max-w-sm px-0.5 text-center text-xs text-balance">
          Click Load History to load the entire conversation
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

export default MessageScrollerLoadHistory;
