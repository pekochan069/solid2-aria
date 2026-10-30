/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/message-scroller-scrollable.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createMemo, For } from "solid-js";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../registry/ui/card";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../registry/ui/message-scroller";
import { MessageAnimated } from "./_chat";
import { useMessageScrollerScrollable } from "./_scroller";

const messages = Array.from({ length: 12 }, (_, index) => ({
  id: `scrollable-${index + 1}`,
  role: index % 2 === 0 ? "user" : "assistant",
  text:
    index % 2 === 0
      ? `Review scroll checkpoint ${index + 1}.`
      : `Checkpoint ${index + 1} is synced. The scrollable hook updates as the viewport moves.\n\nWhen the reader is at the first message, the footer should only point them down. Once they move into the middle of the transcript, it should explain that both directions are available.\n\nAt the latest message, the footer should switch again and only point them back up.`,
})) satisfies {
  id: string;
  role: "user" | "assistant";
  text: string;
}[];

export function MessageScrollerScrollable() {
  return (
    <div class="mx-auto flex w-full max-w-sm flex-col gap-4">
      <Card class="h-140 w-full gap-0 overflow-hidden">
        <CardHeader class="gap-1 border-b">
          <CardTitle>Scroll Status</CardTitle>
          <CardDescription>
            Where the reader can go scroll to based on current scroll position.
          </CardDescription>
        </CardHeader>
        <MessageScrollerProvider>
          <CardContent class="flex-1 overflow-hidden p-0">
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent class="gap-4 p-(--card-spacing)">
                  <Transcript />
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </CardContent>
          <ScrollStateFooter />
        </MessageScrollerProvider>
      </Card>
      <div class="text-muted-foreground px-0.5 text-center text-xs">
        Scroll the transcript to see the footer update.
      </div>
    </div>
  );
}

function Transcript() {
  return (
    <For each={messages}>
      {(message) => (
        <MessageAnimated
          message={message}
          scrollAnchor={message.role === "user"}
          userVariant="muted"
          assistantVariant="ghost"
        />
      )}
    </For>
  );
}

function ScrollStateFooter() {
  const { start, end } = useMessageScrollerScrollable();

  const status = createMemo(() =>
    getScrollStatus({ end: end(), start: start() })
  );

  return (
    <CardFooter class="text-muted-foreground justify-center border-t text-center text-sm">
      {status()}
    </CardFooter>
  );
}

function getScrollStatus({ start, end }: { start: boolean; end: boolean }) {
  if (start && end) {
    return "You can scroll both ways.";
  }

  if (end) {
    return "You are at the top. You can only scroll down.";
  }

  if (start) {
    return "You are at the bottom. You can only scroll up.";
  }

  return "All messages fit in the viewport.";
}

export default MessageScrollerScrollable;
