/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/message-scroller-animation.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
} from "@lucide/solid";
import { createMemo, createSignal, For } from "solid-js";

import { hasKey } from "../lib/has-key";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../registry/ui/empty";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../registry/ui/message-scroller";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../registry/ui/select";
import {
  useChat,
  createChat,
  MESSAGE_ANIMATIONS,
  MessageAnimated,
} from "./_chat";
import type { MessageAnimationId } from "./_chat";

const chat = createChat()
  .user("Can user messages pop in like iMessage without breaking anchoring?")
  .sleep(1000)
  .assistant(
    "Yes. Animate the user row with transform and opacity, and let the assistant response stream normally below it.\n\nThat keeps the row measurement predictable while still giving the newly sent bubble a more tactile entrance."
  )
  .user("What makes the animation feel more like iMessage?")
  .sleep(1000)
  .assistant(
    "Use a quick spring from the trailing edge: a little scale, a small upward move, and no layout animation.\n\nThe bubble feels tactile, but the measured row stays predictable, so anchoring and auto-scroll do not have to fight a changing layout."
  )
  .user("Can I switch between presets while testing the same thread?")
  .sleep(1000)
  .assistant(
    "Yes. Keep the conversation in place while you change the preset, then send the next message to compare the new entrance against the same context.\n\nThat makes it easier to judge the difference between a subtle fade, a snappy pop, and a more dramatic 3D tilt without rebuilding the scenario each time."
  );

const initialMessages = chat.get(0);
const transport = chat.transport({ delayMs: 15 });

export function MessageScrollerAnimation() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: initialMessages,
    transport,
  });

  const [presetId, setPresetId] = createSignal<MessageAnimationId>("fade");
  const nextMessage = createMemo(() => chat.next(messages()));

  const isBusy = createMemo(
    () => status() === "submitted" || status() === "streaming"
  );

  const preset = createMemo(() => MESSAGE_ANIMATIONS[presetId()]);

  return (
    <div class="relative flex flex-col gap-4">
      <Card class="mx-auto h-140 w-full max-w-sm gap-0">
        <CardHeader class="border-b">
          <CardTitle>Animation</CardTitle>
          <CardDescription>
            Choose how user messages are animated when they are added to the
            conversation.
          </CardDescription>
          <CardAction class="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Reset animated messages"
              isDisabled={messages().length === 0 || isBusy()}
              onClick={() => {
                setMessages(initialMessages);
              }}
            >
              <RotateCwIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent class="min-h-0 flex-1 overflow-hidden p-0">
          {messages().length === 0 ? (
            <Empty class="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>No Messages Yet</EmptyTitle>
                <EmptyDescription>
                  Click the button below to send the first message.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScrollerProvider>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent
                    aria-busy={isBusy() ? "true" : "false"}
                    class="p-(--card-spacing)"
                  >
                    {
                      <For each={messages()}>
                        {(message) => (
                          <MessageAnimated
                            message={message}
                            animationPreset={preset()}
                            userVariant="muted"
                            assistantVariant="ghost"
                          />
                        )}
                      </For>
                    }
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          )}
        </CardContent>
        <CardFooter class="border-t">
          <Select
            value={presetId()}
            onChange={(value) => {
              if (value !== null && hasKey(MESSAGE_ANIMATIONS, value)) {
                setPresetId(value);
              }
            }}
          >
            <SelectTrigger aria-label="Animation preset">
              <SelectValue>{preset().name}</SelectValue>
            </SelectTrigger>
            <SelectContent placement="top start">
              <SelectGroup>
                {
                  <For each={Object.values(MESSAGE_ANIMATIONS)}>
                    {(animation) => (
                      <SelectItem id={animation.id}>
                        {animation.name}
                      </SelectItem>
                    )}
                  </For>
                }
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="icon"
            class="ml-auto"
            isDisabled={!nextMessage() || isBusy()}
            onClick={() => {
              if (!nextMessage() || isBusy()) {
                return;
              }

              void sendMessage(nextMessage());
            }}
          >
            <ArrowUpIcon />
            <span class="sr-only">Send Message</span>
          </Button>
        </CardFooter>
      </Card>
      <div class="text-muted-foreground mx-auto max-w-sm px-0.5 text-center text-xs text-balance">
        Select an animation then click send to see it in action.
      </div>
    </div>
  );
}

export default MessageScrollerAnimation;
